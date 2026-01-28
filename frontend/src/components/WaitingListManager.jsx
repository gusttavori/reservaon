import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, Phone, User, MessageSquare } from 'lucide-react';
import './WaitingListManager.css';

const WaitingListManager = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/waiting-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setList(res.data);
    } catch (error) {
      console.error("Erro ao carregar lista");
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/waiting-list/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchList();
    } catch (error) {
      alert("Erro ao atualizar.");
    }
  };

  const openWhatsApp = (phone, name) => {
    const message = `Olá ${name}, surgiu um horário vago! Gostaria de agendar?`;
    const link = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="waiting-container">
      {list.length === 0 ? (
        <div className="empty-waiting">
          <Clock size={48} style={{opacity: 0.3, marginBottom: '1rem'}}/>
          <p>Ninguém na fila de espera no momento.</p>
        </div>
      ) : (
        <div className="waiting-grid">
          {list.map(item => (
            <div key={item.id} className={`waiting-card ${item.status.toLowerCase()}`}>
              <div className="waiting-info">
                <div className="waiting-header">
                  <h4>{item.customerName}</h4>
                  <span className={`status-tag ${item.status.toLowerCase()}`}>
                    {item.status === 'WAITING' ? 'Aguardando' : item.status === 'NOTIFIED' ? 'Notificado' : 'Agendado'}
                  </span>
                </div>
                <p className="waiting-detail"><User size={14}/> {item.serviceName || 'Qualquer serviço'}</p>
                <p className="waiting-detail"><Phone size={14}/> {item.phone}</p>
                {item.notes && <p className="waiting-notes">"{item.notes}"</p>}
                <small className="waiting-time">Entrou em: {new Date(item.createdAt).toLocaleDateString()} às {new Date(item.createdAt).toLocaleTimeString().slice(0,5)}</small>
              </div>

              <div className="waiting-actions">
                <button 
                  className="action-btn-w whatsapp" 
                  onClick={() => {
                    openWhatsApp(item.phone, item.customerName);
                    handleStatus(item.id, 'NOTIFIED');
                  }}
                  title="Chamar no Zap"
                >
                  <MessageSquare size={18}/> Chamar
                </button>
                
                <button 
                  className="action-btn-w schedule"
                  onClick={() => handleStatus(item.id, 'SCHEDULED')}
                  title="Marcar como Agendado"
                >
                  <CheckCircle size={18}/>
                </button>

                <button 
                  className="action-btn-w remove"
                  onClick={() => handleStatus(item.id, 'CANCELLED')}
                  title="Remover"
                >
                  <XCircle size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WaitingListManager;