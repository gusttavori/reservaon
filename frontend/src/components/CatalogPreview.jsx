import { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './CatalogPreview.css';

const CatalogPreview = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/public/companies')
      .then(response => {
        setCompanies(response.data);
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="catalog-section">
      <div className="container">
        <div className="catalog-header">
          <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>Encontre serviços perto de si</h2>
          
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar por nome da empresa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="companies-grid">
          {loading ? (
             <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '2rem'}}>Carregando empresas...</div>
          ) : filteredCompanies.length > 0 ? (
            filteredCompanies.map(company => (
              <div key={company.id} className="company-card">
                <div className="company-banner">
                  <div className="company-logo">
                    {company.logoUrl ? (
                      <img 
                        src={company.logoUrl} 
                        alt={company.name} 
                        style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} 
                      />
                    ) : (
                      company.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="company-info">
                  <h3 className="company-name">{company.name}</h3>
                  <span className="company-category">
                    {company.openingTime} às {company.closingTime}
                  </span>
                  
                  <Link to={`/book/${company.slug}`} style={{textDecoration: 'none'}}>
                    <button className="btn-book" style={{width: '100%', justifyContent: 'center'}}>
                      <span style={{marginRight: '8px'}}>Agendar</span>
                      <Calendar size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div style={{gridColumn: '1/-1', textAlign: 'center', color: '#71717a', padding: '2rem'}}>
              Nenhuma empresa encontrada.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CatalogPreview;