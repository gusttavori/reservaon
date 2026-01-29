import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api'; // <--- IMPORTANTE: Usar a instância configurada
import { Clock, DollarSign, MessageCircle, MapPin, List, Star } from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR';
import { setHours, setMinutes, format } from 'date-fns';
import './BookingPage.css';

registerLocale('pt-BR', ptBR);

const BookingPage = () => {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedService, setSelectedService] = useState(null);
  const [startDate, setStartDate] = useState(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Estados da Lista de Espera
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [waitingData, setWaitingData] = useState({ name: '', phone: '', notes: '' });

  // Estados de Review
  const [reviewsData, setReviewsData] = useState({ average: 0, total: 0 });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // CORREÇÃO: Usando api.get para conectar no Render
        const response = await api.get(`/api/public/${slug}`);
        setCompany(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchCompanyData();
  }, [slug]);

  // Busca Reviews Públicos
  useEffect(() => {
    if (slug) {
      api.get(`/api/reviews/public/${slug}`)
        .then(res => setReviewsData({ average: res.data.average || 0, total: res.data.total || 0 }))
        .catch(err => console.error("Sem reviews"));
    }
  }, [slug]);

  const isWorkDay = (date) => {
    if (!company) return false;
    
    if (company.workSchedule && Array.isArray(company.workSchedule)) {
      const dayIndex = date.getDay();
      const dayConfig = company.workSchedule.find(d => d.day === dayIndex);
      return dayConfig && dayConfig.active;
    }

    const day = date.getDay();
    const allowedDays = company.workDays ? company.workDays.split(',').map(Number) : [];
    return allowedDays.includes(day);
  };

  const getOpenTime = (date) => {
    let hour = 9;
    let minute = 0;

    if (company && date) {
      if (company.workSchedule && Array.isArray(company.workSchedule)) {
        const dayIndex = date.getDay();
        const dayConfig = company.workSchedule.find(d => d.day === dayIndex);
        if (dayConfig && dayConfig.active) {
          [hour, minute] = dayConfig.start.split(':').map(Number);
        }
      } else if (company.openingTime) {
        [hour, minute] = company.openingTime.split(':').map(Number);
      }
    }
    
    const timeDate = new Date(date);
    return setHours(setMinutes(timeDate, minute), hour);
  };

  const getCloseTime = (date) => {
    let hour = 18;
    let minute = 0;

    if (company && date) {
      if (company.workSchedule && Array.isArray(company.workSchedule)) {
        const dayIndex = date.getDay();
        const dayConfig = company.workSchedule.find(d => d.day === dayIndex);
        if (dayConfig && dayConfig.active) {
          [hour, minute] = dayConfig.end.split(':').map(Number);
        }
      } else if (company.closingTime) {
        [hour, minute] = company.closingTime.split(':').map(Number);
      }
    }

    const timeDate = new Date(date);
    return setHours(setMinutes(timeDate, minute), hour);
  };

  const handleOpenModal = (service) => {
    setSelectedService(service);
    setStartDate(null);
    setFormData({ customerName: '', customerPhone: '' });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!startDate) {
      alert("Por favor, selecione uma data e horário.");
      return;
    }
    setSubmitting(true);
    try {
      // CORREÇÃO: Usando api.post
      await api.post('/api/appointments/public', {
        date: startDate,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        serviceId: selectedService.id,
        companyId: company.id
      });
      alert("Agendamento realizado! Vamos confirmar no WhatsApp? 📲");
      setSelectedService(null);
      if (company.whatsapp) {
        const cleanPhone = company.whatsapp.replace(/\D/g, '');
        const dateStr = format(startDate, "dd/MM 'às' HH:mm");
        const message = `Olá! Sou *${formData.customerName}*. \nAcabei de agendar *${selectedService.name}* para *${dateStr}*. \nPode confirmar?`;
        const link = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(link, '_blank');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Erro ao realizar agendamento.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinWaitingList = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/waiting-list/public', {
        companyId: company.id,
        customerName: waitingData.name,
        phone: waitingData.phone,
        serviceName: selectedService ? selectedService.name : 'Qualquer serviço',
        notes: waitingData.notes
      });
      alert("Você entrou na lista de espera! Avisaremos se surgir uma vaga.");
      setShowWaitingModal(false);
      setWaitingData({ name: '', phone: '', notes: '' });
    } catch (error) {
      alert("Erro ao entrar na lista.");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/reviews/public', {
        companyId: company.id,
        rating: newReview.rating,
        comment: newReview.comment,
        customerName: newReview.name
      });
      alert("Obrigado pela sua avaliação! ⭐");
      setShowReviewModal(false);
      setNewReview({ rating: 5, comment: '', name: '' });
    } catch (error) {
      alert("Erro ao enviar avaliação.");
    }
  };

  const handleContactClick = (service) => {
    if (!company.whatsapp) {
      alert("Esta empresa não cadastrou um número de WhatsApp.");
      return;
    }
    const cleanPhone = company.whatsapp.replace(/\D/g, '');
    const message = `Olá! Vi o serviço *${service.name}* (R$ ${Number(service.price).toFixed(2)}) no catálogo e gostaria de agendar um horário.`;
    const link = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
  };

  if (loading) return <div className="loading-screen">Carregando...</div>;
  if (!company) return <div className="loading-screen">Empresa não encontrada.</div>;

  const isBasicPlan = company.plan?.slug?.toLowerCase() === 'basico';
  
  // VERIFICAÇÃO DE PLANO PARA PERMITIR AVALIAÇÃO
  const canReceiveReviews = company.plan && ['avancado', 'premium'].includes(company.plan.slug.toLowerCase());

  return (
    <div className="booking-container">
      <header className="booking-header">
        {company.logoUrl ? (
          <img src={company.logoUrl} alt="Logo" style={{width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
        ) : null}
        
        <h1 style={{fontSize: '1.8rem', marginBottom: '0.5rem'}}>{company.name}</h1>
        
        {/* ESTRELAS DE AVALIAÇÃO */}
        {canReceiveReviews && (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '1rem', cursor: 'pointer'}} onClick={() => setShowReviewModal(true)}>
            <div style={{display: 'flex'}}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < Math.round(reviewsData.average) ? "#eab308" : "none"} color={i < Math.round(reviewsData.average) ? "#eab308" : "#cbd5e1"} />
              ))}
            </div>
            <span style={{fontSize: '0.85rem', color: '#64748b'}}>({reviewsData.total})</span>
          </div>
        )}

        {company.description && (
          <p style={{fontSize: '0.95rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1rem auto', lineHeight: '1.5'}}>
            {company.description}
          </p>
        )}

        {company.address && (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', marginBottom: '1.5rem'}}>
            <MapPin size={16} />
            <span>{company.address}</span>
          </div>
        )}
        
        <div className="status-badge">
          <Clock size={14} /> 
          <span>Consulte horários no calendário</span>
        </div>
      </header>

      <main className="booking-content">
        <h2 className="section-title">Nossos Serviços</h2>
        
        <div className="services-list">
          {company.services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-info">
                <h3>{service.name}</h3>
                <div className="service-meta">
                  <span><Clock size={14}/> {service.duration} min</span>
                  <span style={{marginLeft: '10px'}}><DollarSign size={14}/> {Number(service.price).toFixed(2)}</span>
                </div>
              </div>

              {isBasicPlan ? (
                <button 
                  className="btn-book" 
                  style={{background: '#25D366', color: 'white'}}
                  onClick={() => handleContactClick(service)}
                >
                  <MessageCircle size={18} style={{marginRight: '5px'}}/>
                  Pedir no Zap
                </button>
              ) : (
                <button 
                  className="btn-book" 
                  onClick={() => handleOpenModal(service)}
                >
                  Agendar
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{textAlign: 'center', marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px'}}>
          <p style={{color: '#64748b', marginBottom: '1rem'}}>Não encontrou o horário que queria?</p>
          <button 
            onClick={() => setShowWaitingModal(true)}
            style={{background: 'white', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', color: '#1e293b', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'}}
          >
            <List size={18}/> Entrar na Lista de Espera
          </button>
        </div>

        {canReceiveReviews && (
          <div style={{textAlign: 'center', marginTop: '1rem', paddingBottom: '2rem'}}>
            <button 
              onClick={() => setShowReviewModal(true)}
              style={{background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem'}}
            >
              Avaliar este estabelecimento
            </button>
          </div>
        )}
      </main>

      {/* MODAL DE AGENDAMENTO */}
      {selectedService && !isBasicPlan && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Agendar: {selectedService.name}</h3>
            
            <form onSubmit={handleConfirmBooking}>
              <div className="form-group">
                <label>Seu Nome</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                  placeholder="Ex: Maria Silva"
                />
              </div>

              <div className="form-group">
                <label>Seu WhatsApp</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={formData.customerPhone}
                  onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="form-group">
                <label>Data e Horário</label>
                <div className="custom-datepicker-wrapper">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    locale="pt-BR"
                    dateFormat="d 'de' MMMM 'às' HH:mm"
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    minDate={new Date()}
                    filterDate={isWorkDay}
                    minTime={getOpenTime(startDate || new Date())}
                    maxTime={getCloseTime(startDate || new Date())}
                    placeholderText="Clique para escolher..."
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setSelectedService(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE LISTA DE ESPERA */}
      {showWaitingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Entrar na Lista de Espera</h3>
            <form onSubmit={handleJoinWaitingList}>
              <div className="form-group">
                <label>Seu Nome</label>
                <input className="form-input" required 
                  value={waitingData.name} onChange={e => setWaitingData({...waitingData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input className="form-input" required placeholder="(00) 00000-0000"
                  value={waitingData.phone} onChange={e => setWaitingData({...waitingData, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Preferência (Opcional)</label>
                <input className="form-input" placeholder="Ex: Só posso depois das 18h"
                  value={waitingData.notes} onChange={e => setWaitingData({...waitingData, notes: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowWaitingModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Entrar na Lista</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE AVALIAÇÃO */}
      {showReviewModal && canReceiveReviews && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Avaliar Experiência</h3>
            <form onSubmit={handleSubmitReview}>
              <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem'}}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={32} 
                    fill={star <= newReview.rating ? "#eab308" : "none"} 
                    color={star <= newReview.rating ? "#eab308" : "#cbd5e1"}
                    style={{cursor: 'pointer'}}
                    onClick={() => setNewReview({...newReview, rating: star})}
                  />
                ))}
              </div>
              
              <div className="form-group">
                <label>Seu Nome</label>
                <input className="form-input" required value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} placeholder="Ex: João" />
              </div>
              
              <div className="form-group">
                <label>Comentário (Opcional)</label>
                <textarea className="form-input" rows="3" value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} placeholder="O que achou do serviço?" />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowReviewModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Enviar Avaliação</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;