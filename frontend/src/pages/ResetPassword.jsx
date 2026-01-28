import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return alert("Senhas não conferem!");
    
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/auth/reset-password', {
        token,
        newPassword: password
      });
      alert("Senha alterada! Faça login.");
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao alterar senha. O link pode ter expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc'}}>
      <div style={{background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'}}>
        <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          <Lock size={40} color="#2563eb" />
          <h2 style={{fontSize: '1.5rem', marginTop: '1rem'}}>Nova Senha</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Nova Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box'}}
            />
          </div>
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Confirmar Senha</label>
            <input 
              type="password" 
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box'}}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1}}
          >
            {loading ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;