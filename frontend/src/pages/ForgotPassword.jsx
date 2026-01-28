import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc'}}>
      <div style={{background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'}}>
        
        <Link to="/login" style={{display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
          <ArrowLeft size={16} /> Voltar para Login
        </Link>

        {submitted ? (
          <div style={{textAlign: 'center'}}>
            <div style={{background: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'}}>
              <Mail size={30} color="#166534" />
            </div>
            <h2 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>Verifique seu e-mail</h2>
            <p style={{color: '#64748b'}}>Enviamos as instruções para <strong>{email}</strong></p>
          </div>
        ) : (
          <>
            <h2 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>Esqueceu a senha?</h2>
            <p style={{color: '#64748b', marginBottom: '1.5rem'}}>Digite seu e-mail para receber o link de recuperação.</p>
            
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>E-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box'}}
                  placeholder="seu@email.com"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                style={{width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1}}
              >
                {loading ? 'Enviando...' : 'Enviar Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;