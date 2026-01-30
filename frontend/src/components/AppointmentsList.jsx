import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Phone, Plus, X, Scissors, User, ChevronDown } from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR';
import './AppointmentsList.css';

registerLocale('pt-BR', ptBR);

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    date: new Date()
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resApp, resServ] = await Promise.all([
        api.get('/api/appointments'),
        api.get('/api/services')
      ]);

      setAppointments(resApp.data);
      setServices(resServ.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // Atualização Otimista
    const oldAppointments = [...appointments];
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));

    try {
      await api.put(`/api/appointments/${id}/status`, { status: newStatus });
    } catch (error) {
      alert("Erro ao atualizar status.");
      setAppointments(oldAppointments); // Reverte se der erro
    }
  };

  const handleManualBooking = async (e) => {
    e.preventDefault();
    try {
      // Ajuste para enviar clientName conforme esperado pelo backend
      await api.post('/api/appointments', {
        clientName: formData.customerName,
        clientPhone: formData.customerPhone,
        serviceId: formData.serviceId,
        date: formData.date,
        notes: "Agendamento Manual"
      });
      
      alert("Agendamento criado!");
      setShowModal(false);
      fetchData();
      setFormData({ customerName: '', customerPhone: '', serviceId: '', date: new Date() });
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao criar agendamento.");
    }
  };

  const filterAppointments = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrow = today + 86400000;

    return appointments.filter(app => {
      const appTime = new Date(app.date).getTime();
      if (filter === 'today') return appTime >= today && appTime < tomorrow;
      if (filter === 'tomorrow') return appTime >= tomorrow && appTime < (tomorrow + 86400000);
      return true;
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordem cronológica (mais cedo primeiro)
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Componente Select Personalizado
  const StatusSelect = ({ currentStatus, onChange }) => {
    const getStatusColor = (s) => {
      switch(s) {
        case 'PENDING': return { bg: '#fffbeb', text: '#d97706', border: '#fcd34d' };
        case 'CONFIRMED': return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
        case 'COMPLETED': return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
        case 'CANCELLED': return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
        default: return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
      }
    };

    const style = getStatusColor(currentStatus);

    return (
      <div className="status-select-wrapper" style={{position: 'relative'}}>
        <select 
          value={currentStatus} 
          onChange={(e) => onChange(e.target.value)}
          style={{
            appearance: 'none',
            backgroundColor: style.bg,
            color: style.text,
            border: `1px solid ${style.border}`,
            padding: '6px 28px 6px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '130px',
            transition: 'all 0.2s'
          }}
        >
          <option value="PENDING">Pendente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="COMPLETED">Concluído</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        <ChevronDown size={14} style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', 
          color: style.text, pointerEvents: 'none'
        }}/>
      </div>
    );
  };

  if (loading) return <div className="loading-spinner">Carregando agenda...</div>;

  const filteredApps = filterAppointments();

  return (
    <div className="appointments-container">
      
      <div className="appointments-header">
        <div className="filter-group">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todos</button>
          <button className={`filter-btn ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')}>Hoje</button>
          <button className={`filter-btn ${filter === 'tomorrow' ? 'active' : ''}`} onClick={() => setFilter('tomorrow')}>Amanhã</button>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-new-appointment">
          <Plus size={18} /> Novo Agendamento
        </button>
      </div>

      <div className="appointments-grid">
        {filteredApps.length === 0 ? (
          <div className="empty-agenda">
            <Calendar size={48} style={{opacity: 0.3, marginBottom: '1rem', color: '#94a3b8'}} />
            <p style={{color: '#64748b'}}>Nenhum agendamento encontrado para este período.</p>
          </div>
        ) : (
          filteredApps.map(app => (
            <div key={app.id} className={`appointment-card ${app.status === 'CANCELLED' ? 'cancelled-card' : ''}`}>
              <div className={`status-indicator ${app.status.toLowerCase()}`}></div>
              
              <div className="app-content">
                <div className="app-time-box">
                  <span className="app-date">{formatDate(app.date)}</span>
                  <span className="app-hour">{formatTime(app.date)}</span>
                </div>
                
                <div className="app-details">
                  {/* Usa clientName (manual) ou fallback */}
                  <h4>{app.clientName || app.title || "Cliente Sem Nome"}</h4>
                  <div className="app-meta">
                    <div className="meta-row">
                      <Scissors size={14} /> 
                      <span>{app.serviceName || app.service?.name} • R$ {Number(app.price || app.service?.price).toFixed(2)}</span>
                    </div>
                    {(app.clientPhone) && (
                      <div className="meta-row">
                        <Phone size={14} /> <span>{app.clientPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="app-actions">
                <StatusSelect 
                  currentStatus={app.status} 
                  onChange={(newVal) => handleStatusChange(app.id, newVal)} 
                />
              </div>

            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Novo Agendamento</h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleManualBooking} className="modal-form">
              <div className="form-group">
                <label>Nome do Cliente</label>
                <div className="input-icon-wrapper">
                  <User size={18} className="input-icon" />
                  <input type="text" required className="modal-input with-icon"
                    value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})}
                    placeholder="Ex: João da Silva"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Telefone / WhatsApp</label>
                <div className="input-icon-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input type="text" className="modal-input with-icon"
                    value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Serviço</label>
                <select required className="modal-input"
                  value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {Number(s.price).toFixed(2)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Data e Hora</label>
                <DatePicker 
                  selected={formData.date} 
                  onChange={date => setFormData({...formData, date})}
                  showTimeSelect dateFormat="Pp" locale="pt-BR"
                  className="modal-input" wrapperClassName="datePicker"
                  timeFormat="HH:mm" timeIntervals={30}
                />
              </div>
              <button type="submit" className="btn-submit-modal">Confirmar Agendamento</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;