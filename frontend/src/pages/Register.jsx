import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  Mail, 
  Lock
} from 'lucide-react';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get('plan');

  const [accountType, setAccountType] = useState('business');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyName: accountType === 'business' ? formData.name : `Conta Pessoal - ${formData.name}`,
        planSlug: planFromUrl || (accountType === 'business' ? 'profissional' : 'basico')
      };

      await axios.post('http://localhost:3000/api/auth/register', payload);

      alert(`Sucesso! Bem-vindo ao ReservaON.`);
      navigate('/login'); 

    } catch (error) {
      console.error("Erro no registro:", error);
      const errorMessage = error.response?.data?.error || "Ocorreu um erro ao conectar com o servidor.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-banner">
        <div className="banner-content">
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold'}}>ReservaON.</h2>
        </div>
        
        <div className="banner-content">
          <blockquote className="quote">
            {accountType === 'business' 
              ? "Junte-se a mais de 1.200 empresas que automatizaram a sua agenda e aumentaram o faturamento."
              : "Encontre os melhores profissionais e agende seus serviços em segundos, sem ligações."}
          </blockquote>
          <span className="author">
            {accountType === 'business' ? "Comece a crescer hoje." : "Simplifique sua rotina."}
          </span>
        </div>
        
        <div style={{fontSize: '0.8rem', opacity: 0.5}}>
          © 2026 ReservaON Inc.
        </div>
      </div>

      <div className="register-form-wrapper">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Home
        </Link>

        <div className="register-box">
          <div className="form-header">
            <h1>Crie a sua conta</h1>
            <p>
              {planFromUrl 
                ? `Você selecionou o plano ${planFromUrl.toUpperCase()}` 
                : "Preencha os dados abaixo para começar."}
            </p>
          </div>

          <div className="account-selector">
            <button 
              className={`selector-btn ${accountType === 'business' ? 'active' : ''}`}
              onClick={() => setAccountType('business')}
              type="button"
            >
              <Briefcase size={16} />
              Sou Profissional
            </button>
            <button 
              className={`selector-btn ${accountType === 'client' ? 'active' : ''}`}
              onClick={() => setAccountType('client')}
              type="button"
            >
              <User size={16} />
              Sou Cliente
            </button>
          </div>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label className="input-label">
                {accountType === 'business' ? 'Nome do Estabelecimento' : 'Seu Nome Completo'}
              </label>
              <div style={{position: 'relative'}}>
                <input 
                  type="text" 
                  name="name"
                  className="input-field" 
                  placeholder={accountType === 'business' ? "Ex: Barbearia Viking" : "Ex: João Silva"}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <User size={18} style={{position: 'absolute', right: '12px', top: '12px', color: '#a1a1aa'}} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">E-mail Profissional</label>
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

            <div style={{display: 'flex', gap: '1rem'}}>
              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Senha</label>
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
                </div>
              </div>
              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Confirmar</label>
                <div style={{position: 'relative'}}>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    className="input-field" 
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <div className="form-footer">
            Já tem uma conta?{' '}
            <Link to="/login" className="link-highlight">
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;