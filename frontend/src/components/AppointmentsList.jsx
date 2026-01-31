import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Phone, Plus, X, Scissors, User, ChevronDown, Clock } from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR';
import './AppointmentsList.css';

registerLocale('pt-BR', ptBR);

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, tomorrow
  
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
    // Atualização Otimista (Muda na tela antes de confirmar no banco)
    const oldAppointments = [...appointments];
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));

    try {
      // Usa rota específica de status
      await api.put(`/api/appointments/${id}/status`, { status: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status. Verifique sua conexão.");
      setAppointments(oldAppointments); // Reverte se der erro
    }
  };

  const handleManualBooking = async (e) => {
    e.preventDefault();
    try {
      // --- CORREÇÃO DE FUSO HORÁRIO ---
      // Garante que o horário selecionado (ex: 16:00) chegue como 16:00 no servidor
      const dateToSend = new Date(formData.date);
      dateToSend.setMinutes(dateToSend.getMinutes() - dateToSend.getTimezoneOffset());

      await api.post('/api/appointments', {
        clientName: formData.customerName,
        clientPhone: formData.customerPhone,
        serviceId: formData.serviceId,
        date: dateToSend, // Envia a data ajustada
        notes: "Agendamento Manual (Pelo Admin)"
      });
      
      alert("Agendamento criado com sucesso!");
      setShowModal(false);
      fetchData(); // Recarrega a lista
      setFormData({ customerName: '', customerPhone: '', serviceId: '', date: new Date() });
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao criar agendamento.";
      alert(msg);
    }
  };

  const filterAppointments = () => {
    const now = new Date();
    // Zera as horas para comparar apenas o dia
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrowStart = todayStart + 86400000; // +24 horas
    const afterTomorrowStart = tomorrowStart + 86400000;

    return appointments.filter(app => {
      const appTime = new Date(app.date).getTime();
      
      if (filter === 'today') {
        return appTime >= todayStart && appTime < tomorrowStart;
      }
      if (filter === 'tomorrow') {
        return appTime >= tomorrowStart && appTime < afterTomorrowStart;
      }
      return true; // 'all'
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordena do mais antigo para o mais novo
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Componente Select Personalizado para Status
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
      <div className="status-select-wrapper" style={{position: 'relative', display: 'inline-block'}}>
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
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '120px',
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

  if (loading) return <div className="loading-state">Carregando agenda...</div>;

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
          <Plus size={18} /> <span className="btn-text-mobile">Novo</span>
        </button>
      </div>

      <div className="appointments-grid">
        {filteredApps.length === 0 ? (
          <div className="empty-agenda">
            <Calendar size={48} style={{opacity: 0.3, marginBottom: '1rem', color: '#94a3b8'}} />
            <h3 style={{color: '#64748b', fontSize: '1.1rem'}}>Agenda vazia</h3>
            <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>Nenhum agendamento para este período.</p>
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
                  {/* Tenta pegar nome do cliente, usuário logado ou título genérico */}
                  <h4 title={app.clientName || app.user?.name}>
                    {app.clientName || app.user?.name || "Cliente Sem Nome"}
                  </h4>
                  
                  <div className="app-meta">
                    <div className="meta-row">
                      <Scissors size={14} /> 
                      <span>{app.serviceName || app.service?.name}</span>
                    </div>

                    {/* MOSTRAR PROFISSIONAL OU "SEM PREFERÊNCIA" */}
                    <div className="meta-row" style={{
                      color: app.professionalName ? '#64748b' : '#16a34a', // Verde se for livre
                      fontWeight: app.professionalName ? 'normal' : '600'
                    }}>
                        <User size={14} /> 
                        <span>
                           {app.professionalName 
                             ? `Prof.: ${app.professionalName}` 
                             : "Sem preferência (Livre)"}
                        </span>
                    </div>

                    {/* Mostra preço se disponível */}
                    {(app.price || app.service?.price) && (
                         <div className="meta-row price-row">
                            <span>R$ {Number(app.price || app.service?.price).toFixed(2)}</span>
                         </div>
                    )}
                    
                    {(app.clientPhone || app.user?.phone) && (
                      <div className="meta-row">
                        <Phone size={14} /> 
                        <a 
                          href={`https://wa.me/55${(app.clientPhone || app.user?.phone || '').replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{color: 'inherit', textDecoration: 'none', ':hover': {textDecoration: 'underline'}}}
                        >
                            {app.clientPhone || app.user?.phone}
                        </a>
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
                <div className="input-icon-wrapper">
                    <Scissors size={18} className="input-icon" />
                    <select required className="modal-input with-icon"
                        value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {Number(s.price).toFixed(2)}</option>)}
                    </select>
                </div>
              </div>
              <div className="form-group">
                <label>Data e Hora</label>
                <div className="input-icon-wrapper">
                    <Clock size={18} className="input-icon" style={{zIndex: 1}} />
                    <DatePicker 
                    selected={formData.date} 
                    onChange={date => setFormData({...formData, date})}
                    showTimeSelect dateFormat="dd/MM/yyyy HH:mm" locale="pt-BR"
                    className="modal-input with-icon" wrapperClassName="datePicker"
                    timeFormat="HH:mm" timeIntervals={30}
                    />
                </div>
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