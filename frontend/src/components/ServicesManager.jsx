import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, X, Clock, DollarSign } from 'lucide-react';
import './ServicesManager.css';

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Controla a caixa flutuante

  const [newService, setNewService] = useState({
    name: '',
    price: '',
    duration: '',
    bufferTime: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data);
    } catch (error) {
      console.error("Erro ao buscar serviços");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/services', newService, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Serviço criado com sucesso!");
      setNewService({ name: '', price: '', duration: '', bufferTime: '' });
      setShowModal(false); // Fecha o modal após criar
      fetchServices();
    } catch (error) {
      alert("Erro ao criar serviço.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (error) {
      alert("Erro ao deletar.");
    }
  };

  if (loading) return <p>Carregando serviços...</p>;

  return (
    <div className="services-container">
      
      {/* CABEÇALHO COM BOTÃO DE ADICIONAR */}
      <div className="services-header-row">
        <div>
          <h3 className="section-subtitle">Catálogo de Serviços</h3>
          <p className="section-description">Gerencie os serviços que seus clientes podem agendar.</p>
        </div>
        <button className="btn-add-service" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Novo Serviço
        </button>
      </div>

      {/* LISTA DE SERVIÇOS (Agora ocupa a largura total) */}
      <div className="services-list-full">
        {services.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum serviço cadastrado ainda.</p>
            <button onClick={() => setShowModal(true)}>Cadastrar o primeiro</button>
          </div>
        ) : (
          <div className="services-grid-layout">
            {services.map(service => (
              <div key={service.id} className="service-card-item">
                <div className="service-card-content">
                  <h4>{service.name}</h4>
                  <div className="service-details">
                    <span className="badge-price">
                      <DollarSign size={14} /> R$ {Number(service.price).toFixed(2)}
                    </span>
                    <span className="badge-time">
                      <Clock size={14} /> {service.duration} min
                    </span>
                    {service.bufferTime > 0 && (
                      <span className="badge-buffer" title="Tempo de intervalo pós-serviço">
                        + {service.bufferTime}m intervalo
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(service.id)} 
                  className="btn-delete-icon"
                  title="Excluir Serviço"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL / CAIXA FLUTUANTE */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop-in">
            <div className="modal-header">
              <h3>Novo Serviço</h3>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="service-form">
              <div className="form-group">
                <label>Nome do Serviço</label>
                <input 
                  type="text" 
                  placeholder="Ex: Corte Degradê"
                  required
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: e.target.value})}
                  className="input-field"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preço (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    required
                    value={newService.price}
                    onChange={e => setNewService({...newService, price: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Duração (minutos)</label>
                  <input 
                    type="number" 
                    placeholder="30"
                    required
                    value={newService.duration}
                    onChange={e => setNewService({...newService, duration: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="buffer-section">
                <label className="buffer-label">
                  ⏳ Intervalo Pós-Atendimento (Opcional)
                </label>
                <input 
                  type="number" 
                  placeholder="Ex: 10 (minutos de limpeza)"
                  value={newService.bufferTime}
                  onChange={e => setNewService({...newService, bufferTime: e.target.value})}
                  className="input-field"
                />
                <p className="help-text">Tempo extra bloqueado na agenda após o serviço.</p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm-add">
                  Adicionar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServicesManager;