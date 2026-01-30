import { useState, useEffect } from 'react';
import api from '../services/api'; // IMPORTANTE: Usa a instância 'api' configurada
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
      // Usa 'api' em vez de 'axios' direto para pegar URL e Token certos
      const res = await api.get('/api/waiting-list');
      setList(res.data);
    } catch (error) {
      console.error("Erro ao carregar lista");
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      if (status === 'CANCELLED') {
        if(!confirm("Remover da lista?")) return;
        await api.delete(`/api/waiting-list/${id}`);
      } else {
        // Se tivesse rota de update status, seria aqui. 
        // Como o backend atual só tem DELETE e GET, vamos assumir que 'SCHEDULED' remove da lista
        if (status === 'SCHEDULED') {
           if(!confirm("Marcar como agendado e remover da lista?")) return;
           await api.delete(`/api/waiting-list/${id}`);
        }
      }
      fetchList();
    } catch (error) {
      alert("Erro ao atualizar.");
    }
  };

  const openWhatsApp = (phone, name) => {
    const message = `Olá ${name}, surgiu um horário vago na nossa agenda! Gostaria de aproveitar?`;
    const link = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
  };

  if (loading) return <p className="loading-text">Carregando lista...</p>;

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
            <div key={item.id} className={`waiting-card ${item.status?.toLowerCase() || 'waiting'}`}>
              <div className="waiting-info">
                <div className="waiting-header">
                  <h4>{item.customerName}</h4>
                  <span className={`status-tag ${item.status?.toLowerCase() || 'waiting'}`}>
                    {item.status === 'WAITING' ? 'Aguardando' : 'Notificado'}
                  </span>
                </div>
                <p className="waiting-detail"><User size={14}/> {item.serviceName || 'Qualquer serviço'}</p>
                <p className="waiting-detail"><Phone size={14}/> {item.phone}</p>
                {item.notes && <p className="waiting-notes">"{item.notes}"</p>}
                
                <small className="waiting-time">
                  Entrou em: {new Date(item.createdAt).toLocaleDateString('pt-BR')} às {new Date(item.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                </small>
              </div>

              <div className="waiting-actions">
                <button 
                  className="action-btn-w whatsapp" 
                  onClick={() => openWhatsApp(item.phone, item.customerName)}
                  title="Chamar no Zap"
                >
                  <MessageSquare size={18}/> Chamar
                </button>
                
                <button 
                  className="action-btn-w schedule"
                  onClick={() => handleStatus(item.id, 'SCHEDULED')}
                  title="Marcar como Agendado (Remove da lista)"
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