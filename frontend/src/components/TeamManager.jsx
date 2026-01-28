import { useState, useEffect } from 'react';
import api from '../services/api'; // Importante
import { UserPlus, Trash2, Mail, Shield } from 'lucide-react';
import './TeamManager.css';

const TeamManager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/api/team');
      setMembers(res.data);
    } catch (error) {
      console.error("Erro ao carregar equipe");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/team', newMember);
      alert("Membro adicionado! Ele pode logar com a senha definida.");
      setNewMember({ name: '', email: '', password: '' });
      fetchTeam();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao adicionar membro.");
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remover este membro da equipe?")) return;
    try {
      await api.delete(`/api/team/${id}`);
      fetchTeam();
    } catch (error) {
      alert("Erro ao remover membro.");
    }
  };

  if (loading) return <p>Carregando equipe...</p>;

  return (
    <div className="team-container">
      <div className="team-grid">
        
        {/* Card Adicionar */}
        <div className="team-form-card">
          <div className="card-header-team">
            <UserPlus size={20} /> <h3>Adicionar Profissional</h3>
          </div>
          <form onSubmit={handleAddMember}>
            <div className="form-group">
              <label>Nome</label>
              <input 
                type="text" required className="team-input" placeholder="Nome do funcionário"
                value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>E-mail de Acesso</label>
              <input 
                type="email" required className="team-input" placeholder="email@equipe.com"
                value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Senha Inicial</label>
              <input 
                type="password" required className="team-input" placeholder="******"
                value={newMember.password} onChange={e => setNewMember({...newMember, password: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-add-team">Cadastrar Membro</button>
          </form>
        </div>

        {/* Lista de Membros */}
        <div className="team-list-card">
          <h3>Membros Ativos ({members.length})</h3>
          <div className="members-list">
            {members.length === 0 ? <p>Apenas você na equipe.</p> : (
              members.map(member => (
                <div key={member.id} className="member-item">
                  <div className="member-avatar">
                    {member.name.charAt(0)}
                  </div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <span className="member-email"><Mail size={12}/> {member.email}</span>
                  </div>
                  <div className="member-role">
                    <Shield size={14}/> {member.role === 'OWNER' ? 'Dono' : 'Equipe'}
                  </div>
                  {member.role !== 'OWNER' && (
                    <button onClick={() => handleRemove(member.id)} className="btn-remove-member">
                      <Trash2 size={16}/>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamManager;