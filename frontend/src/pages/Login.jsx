import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import logoImg from '../assets/reservaon.png'; // <--- Importe a imagem aqui
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard'); 

    } catch (error) {
      console.error("Erro no login:", error);
      const msg = error.response?.data?.error || "E-mail ou senha incorretos.";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-banner">
        <div className="banner-content">
          {/* SUBSTITUÍDO O TEXTO PELA IMAGEM */}
          <img src={logoImg} alt="ReservaON" className="login-logo" />
        </div>
        <div className="banner-content">
          <blockquote className="quote">
            "Para alcançar grandes coisas, devemos não apenas agir, mas também sonhar; não apenas planejar, mas também acreditar."
          </blockquote>
          <span className="author">Anatole France</span>
        </div>
        <div style={{fontSize: '0.8rem', opacity: 0.5}}>
          © 2026 ReservaON Inc.
        </div>
      </div>

      <div className="login-form-wrapper">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Home
        </Link>

        <div className="login-box">
          <div className="form-header">
            <h1>Bem-vindo de volta</h1>
            <p>Acesse sua conta para gerenciar seus agendamentos.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <div style={{position: 'relative'}}>
                <input 
                  type="email" 
                  name="email"
                  className="input-field" 
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Mail size={18} style={{position: 'absolute', right: '12px', top: '12px', color: '#a1a1aa'}} />
              </div>
            </div>

            <div className="input-group">
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                <label className="input-label">Senha</label>
                <Link to="/forgot-password" style={{fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none'}}>
                  Esqueceu a senha?
                </Link>
              </div>
              <div style={{position: 'relative'}}>
                <input 
                  type="password" 
                  name="password"
                  className="input-field" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Lock size={18} style={{position: 'absolute', right: '12px', top: '12px', color: '#a1a1aa'}} />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar na Plataforma'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="form-footer">
            Não tem uma conta?{' '}
            <Link to="/register" className="link-highlight">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;