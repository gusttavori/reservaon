import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, AlertCircle } from 'lucide-react';
import './TeamManager.css';

const TeamManager = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ 
    name: '', email: '', password: '', canViewFinancials: false 
  });
  const [limit, setLimit] = useState(3); 

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/team', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeam(res.data);
    } catch (error) {
      console.error("Erro ao buscar equipe");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/team', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Profissional adicionado!");
      setNewUser({ name: '', email: '', password: '', canViewFinancials: false });
      fetchTeam();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao adicionar membro.");
    }
  };

  const handleRemoveMember = async (id) => {
    if(!confirm("Tem certeza que deseja remover este membro?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/team/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeam();
    } catch (error) {
      alert("Erro ao remover.");
    }
  };

  if (loading) return <p>Carregando equipe...</p>;

  return (
    <div className="team-container">
      
      <div className="limit-alert">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <AlertCircle size={20}/>
          <span>Gerencie o acesso da sua equipe.</span>
        </div>
        <strong>{team.length} Membros</strong>
      </div>

      <form onSubmit={handleAddMember} className="add-member-form">
        <div className="form-group grow">
          <label className="input-label">Nome Completo</label>
          <input type="text" required className="input-field" 
            value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
          />
        </div>
        <div className="form-group grow">
          <label className="input-label">E-mail</label>
          <input type="email" required className="input-field" 
            value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
          />
        </div>
        <div className="form-group grow">
          <label className="input-label">Senha</label>
          <input type="text" required className="input-field" 
            value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
          />
        </div>
        
        {/* CHECKBOX DE PERMISSÃO */}
        <div className="form-group checkbox-group" style={{display:'flex', alignItems:'center', marginTop:'24px'}}>
          <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize:'0.9rem'}}>
            <input 
              type="checkbox" 
              checked={newUser.canViewFinancials}
              onChange={e => setNewUser({...newUser, canViewFinancials: e.target.checked})}
              style={{width:'16px', height:'16px'}}
            />
            Ver Financeiro
          </label>
        </div>

        <button type="submit" className="btn-save" style={{background: '#000000'}}>
          <UserPlus size={18} style={{marginRight: '8px'}}/> Adicionar
        </button>
      </form>

      <div className="team-list">
        {team.map(member => (
          <div key={member.id} className="team-member-card">
            <div className="member-info">
              <div className="member-avatar">
                {member.name.charAt(0)}
              </div>
              <div>
                <h4 style={{margin: '0 0 4px 0'}}>{member.name}</h4>
                <span style={{fontSize: '0.9rem', color: '#64748b'}}>{member.email}</span>
                {member.canViewFinancials && <span style={{marginLeft:'8px', fontSize:'0.75rem', background:'#dcfce7', color:'#166534', padding:'2px 6px', borderRadius:'4px'}}>Financeiro</span>}
              </div>
              <span className={`role-badge ${member.role.toLowerCase()}`}>
                {member.role === 'OWNER' ? 'Dono' : 'Profissional'}
              </span>
            </div>
            
            {member.role !== 'OWNER' && (
              <button onClick={() => handleRemoveMember(member.id)} className="btn-remove" title="Remover acesso">
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default TeamManager;