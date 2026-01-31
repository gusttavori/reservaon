import { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, CheckCircle, XCircle, Phone, User, MessageSquare, Calendar } from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR';
import './WaitingListManager.css';

registerLocale('pt-BR', ptBR);

const WaitingListManager = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  
  // Estado para o Modal de Encaixe
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: new Date(),
    serviceId: ''
  });

  useEffect(() => {
    fetchList();
    fetchServices();
  }, []);

  const fetchList = async () => {
    try {
      const res = await api.get('/api/waiting-list');
      setList(res.data);
    } catch (error) {
      console.error("Erro ao carregar lista");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/api/services');
      setServices(res.data);
    } catch (error) {
      console.error("Erro ao carregar serviços");
    }
  };

  // Abre o modal para confirmar o encaixe
  const openBookingModal = (item) => {
    setSelectedItem(item);
    
    // Tenta encontrar o serviço pelo nome
    const serviceFound = services.find(s => s.name === item.serviceName);
    
    // Tenta extrair a data do texto "notes" se houver (formato esperado: dd/MM/yyyy às HH:mm)
    let initialDate = new Date();
    if (item.notes && item.notes.includes('às')) {
        try {
            const datePart = item.notes.split('para: ')[1]; // Pega depois de "para: "
            if (datePart) {
                // Converte string pt-BR para Date object
                const [dateStr, timeStr] = datePart.split(' às ');
                const [day, month, year] = dateStr.split('/');
                const [hour, minute] = timeStr.split(':');
                initialDate = new Date(year, month - 1, day, hour, minute);
            }
        } catch (e) {
            console.log("Não foi possível ler a data automática, usando atual.");
        }
    }

    setBookingData({
        date: initialDate,
        serviceId: serviceFound ? serviceFound.id : (services[0]?.id || '')
    });
    setShowModal(true);
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
        // 1. Cria o Agendamento (com correção de fuso)
        const dateToSend = new Date(bookingData.date);
        dateToSend.setMinutes(dateToSend.getMinutes() - dateToSend.getTimezoneOffset());

        await api.post('/api/appointments', {
            clientName: selectedItem.customerName,
            clientPhone: selectedItem.phone,
            serviceId: bookingData.serviceId,
            date: dateToSend,
            notes: `Encaixe da Lista de Espera. Obs original: ${selectedItem.notes}`
        });

        // 2. Remove da Lista de Espera
        await api.delete(`/api/waiting-list/${selectedItem.id}`);

        alert("Encaixe realizado com sucesso! Cliente movido para a Agenda.");
        setShowModal(false);
        setSelectedItem(null);
        fetchList(); // Atualiza a lista
    } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || "Erro ao realizar encaixe.");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Remover permanentemente da lista?")) return;
    try {
        await api.delete(`/api/waiting-list/${id}`);
        fetchList();
    } catch (error) {
        alert("Erro ao remover.");
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
                {item.notes && <p className="waiting-notes" title={item.notes}>{item.notes}</p>}
                
                <small className="waiting-time">
                  Entrou em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </small>
              </div>

              <div className="waiting-actions">
                <button 
                  className="action-btn-w whatsapp" 
                  onClick={() => openWhatsApp(item.phone, item.customerName)}
                  title="Chamar no Zap"
                >
                  <MessageSquare size={18}/>
                </button>
                
                {/* Botão de Encaixar (Abre Modal) */}
                <button 
                  className="action-btn-w schedule"
                  onClick={() => openBookingModal(item)}
                  title="Encaixar na Agenda"
                  style={{background: '#16a34a', color: 'white', border: 'none'}}
                >
                  <Calendar size={18}/>
                </button>

                <button 
                  className="action-btn-w remove"
                  onClick={() => handleDelete(item.id)}
                  title="Remover da Lista"
                >
                  <XCircle size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE ENCAIXE */}
      {showModal && selectedItem && (
        <div className="modal-overlay">
            <div className="modal-card">
                <h3>Confirmar Encaixe</h3>
                <p style={{marginBottom: '1rem', color: '#64748b'}}>
                    Transformar o pedido de <strong>{selectedItem.customerName}</strong> em agendamento?
                </p>
                
                <form onSubmit={confirmBooking}>
                    <div className="form-group">
                        <label>Data e Hora</label>
                        <DatePicker 
                            selected={bookingData.date} 
                            onChange={date => setBookingData({...bookingData, date})}
                            showTimeSelect dateFormat="dd/MM/yyyy HH:mm" locale="pt-BR"
                            className="modal-input"
                            timeFormat="HH:mm" timeIntervals={30}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Serviço</label>
                        <select 
                            className="modal-input"
                            value={bookingData.serviceId}
                            onChange={e => setBookingData({...bookingData, serviceId: e.target.value})}
                            required
                        >
                            <option value="">Selecione...</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - R$ {Number(s.price).toFixed(2)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button type="submit" className="btn-confirm">Confirmar e Agendar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default WaitingListManager;