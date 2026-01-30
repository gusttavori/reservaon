import { useState, useEffect } from 'react';
import api from '../services/api';
import { UserPlus, Trash2, Mail, Shield, Edit2 } from 'lucide-react';
import './TeamManager.css';

const TeamManager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para EDIÇÃO
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    canViewFinancials: false,
    canManageAgenda: true
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // MODO EDIÇÃO (PUT)
        await api.put(`/api/team/${editId}`, {
          name: formData.name,
          canViewFinancials: formData.canViewFinancials,
          canManageAgenda: formData.canManageAgenda
        });
        alert("Permissões atualizadas com sucesso!");
      } else {
        // MODO CRIAÇÃO (POST)
        await api.post('/api/team', formData);
        alert("Membro adicionado! Ele pode logar com a senha definida.");
      }
      
      resetForm();
      fetchTeam();
    } catch (error) {
      alert(error.response?.data?.error || "Erro na operação.");
    }
  };

  const handleEdit = (member) => {
    setIsEditing(true);
    setEditId(member.id);
    // Preenche o form
    setFormData({
      name: member.name,
      email: member.email,
      password: '', // Senha vazia na edição
      canViewFinancials: member.canViewFinancials,
      canManageAgenda: member.canManageAgenda
    });
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

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', email: '', password: '', canViewFinancials: false, canManageAgenda: true });
  };

  if (loading) return <p>Carregando equipe...</p>;

  return (
    <div className="team-container">
      <div className="team-grid">
        
        {/* Formulário (Criação e Edição) */}
        <div className="team-form-card">
          <div className="card-header-team">
            <UserPlus size={20} /> 
            <h3>{isEditing ? 'Editar Permissões' : 'Adicionar Profissional'}</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome</label>
              <input 
                type="text" required className="team-input" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>E-mail de Acesso</label>
              <input 
                type="email" required className="team-input" disabled={isEditing}
                placeholder={isEditing ? "Não editável" : "email@equipe.com"}
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {!isEditing && (
              <div className="form-group">
                <label>Senha Inicial</label>
                <input 
                  type="password" required className="team-input" placeholder="******"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            )}

            <div className="form-group" style={{marginTop: '1rem'}}>
              <label style={{marginBottom: '0.5rem', display: 'block'}}>Permissões:</label>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem'}}>
                  <input 
                    type="checkbox"
                    checked={formData.canManageAgenda}
                    onChange={e => setFormData({...formData, canManageAgenda: e.target.checked})}
                  />
                  Gerenciar Agenda
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem'}}>
                  <input 
                    type="checkbox"
                    checked={formData.canViewFinancials}
                    onChange={e => setFormData({...formData, canViewFinancials: e.target.checked})}
                  />
                  Ver Financeiro
                </label>
              </div>
            </div>

            <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
              <button type="submit" className="btn-add-team">
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Membro'}
              </button>
              
              {isEditing && (
                <button type="button" onClick={resetForm} className="btn-cancel" style={{padding: '0 15px', border: '1px solid #ccc', borderRadius: '8px', background: 'white', cursor: 'pointer'}}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista */}
        <div className="team-list-card">
          <h3>Membros ({members.length})</h3>
          <div className="members-list">
            {members.map(member => (
              <div key={member.id} className="member-item">
                <div className="member-avatar">
                  {member.name.charAt(0)}
                </div>
                <div className="member-info">
                  <h4>{member.name}</h4>
                  <span className="member-email"><Mail size={12}/> {member.email}</span>
                  <div style={{fontSize: '0.75rem', color: '#64748b', marginTop: '4px'}}>
                    {member.canManageAgenda ? '📅 Agenda ' : ''} 
                    {member.canViewFinancials ? '💰 Financeiro' : ''}
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: '5px'}}>
                  {member.role !== 'OWNER' && (
                    <>
                      <button onClick={() => handleEdit(member)} className="btn-remove-member" style={{color: '#3b82f6'}} title="Editar Permissões">
                        <Edit2 size={16}/>
                      </button>
                      <button onClick={() => handleRemove(member.id)} className="btn-remove-member" title="Remover">
                        <Trash2 size={16}/>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamManager;