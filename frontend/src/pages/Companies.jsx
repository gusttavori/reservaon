import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, MapPin, Star, Filter, Calendar, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Companies.css';

const CATEGORIES = ["Todos", "Barbearia", "Salão de Beleza", "Clínica de Estética", "Saúde", "Esporte", "Outros"];

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  useEffect(() => {
    api.get('/api/public/companies')
      .then(response => {
        setCompanies(response.data);
      })
      .catch(error => console.error("Erro:", error))
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const companyCategory = company.category || "Outros";
    const matchesCategory = selectedCategory === "Todos" || companyCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="catalog-container">
      <div className="container catalog-layout">
        
        {/* --- NOVA SIDEBAR --- */}
        <aside className="filters-sidebar">
          
          {/* GRUPO CATEGORIAS */}
          <div className="filter-section">
            <h3 className="filter-heading">
              <Filter size={14} /> CATEGORIAS
            </h3>
            <div className="category-list">
              {CATEGORIES.map(cat => (
                <label 
                  key={cat} 
                  className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                >
                  <input 
                    type="radio" 
                    name="category" 
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="hidden-radio" 
                  />
                  <span className="radio-custom"></span> 
                  <span className="category-text">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="sidebar-divider" />

          {/* GRUPO LOCALIZAÇÃO */}
          <div className="filter-section">
            <h3 className="filter-heading">
              <Map size={14} /> LOCALIZAÇÃO
            </h3>
            <div className="location-input-wrapper">
              <MapPin size={18} className="location-icon" />
              <input type="text" placeholder="Ex: Centro, Bairro Brasil..." />
            </div>
          </div>

        </aside>

        {/* ÁREA DE RESULTADOS */}
        <section className="results-area">
          <div className="results-header">
            <div>
              <h1 className="page-title">Explorar</h1>
              <span className="results-count">
                {loading ? 'Buscando...' : `${filtered.length} locais encontrados`}
              </span>
            </div>
            <div className="main-search-bar">
              <Search size={20} color="#71717a" />
              <input 
                type="text" 
                placeholder="Buscar por nome..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="catalog-grid">
            {loading ? (
              <p style={{padding: '2rem', color: '#64748b'}}>Carregando catálogo...</p>
            ) : filtered.length === 0 ? (
              <div className="no-results"><p>Nenhuma empresa encontrada.</p></div>
            ) : (
              filtered.map(item => (
                <div key={item.id} className="catalog-card" onClick={() => navigate(`/book/${item.slug}`)}>
                  <div className="card-top">
                    <div className="card-logo-wrapper">
                      {item.logoUrl ? <img src={item.logoUrl} alt={item.name} /> : <span className="initials">{item.name.substring(0, 2).toUpperCase()}</span>}
                    </div>
                    <div className="card-header-info">
                      <span className="category-tag">{item.category || 'Serviços'}</span>
                      <h3 className="card-name">{item.name}</h3>
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="detail-row">
                      {item.averageRating ? (
                        <div className="rating-pill"><Star size={13} fill="#eab308" color="#eab308" /><span>{Number(item.averageRating).toFixed(1)}</span></div>
                      ) : (<div className="rating-pill new">Novo</div>)}
                      <div className="address-row" title={item.address}><MapPin size={14} className="icon-shrink" /><span className="address-text">{item.address ? item.address : 'Localização não informada'}</span></div>
                    </div>
                  </div>
                  <button className="btn-card-action">Agendar <Calendar size={16} /></button>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Companies;