// src/components/Hero.jsx
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        {/* Texto */}
        <div className="hero-content">
          <h1 className="hero-headline">
            A sua agenda inteligente, simplificada.
          </h1>
          <p className="hero-subheadline">
            Agendamentos online automáticos, controlo financeiro e mais clientes para o seu negócio. 
            Elimine as faltas e organize a sua vida profissional.
          </p>
          
          <div className="hero-actions">
            <a href="#planos" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Começar agora <ArrowRight size={18} />
            </a>
            <a href="#funcionalidades" className="btn-secondary">
              Ver funcionalidades
            </a>
          </div>
        </div>

        {/* Ilustração / Mockup CSS */}
        <div className="hero-visual">
          <div className="mockup-card">
            {/* Cabeçalho do Mockup */}
            <div className="mockup-header">
              <div className="mockup-line w-40" style={{background: '#000'}}></div>
              <div className="mockup-line w-40"></div>
            </div>

            {/* Lista de agendamentos simulada */}
            <div className="schedule-item">
              <div className="avatar-placeholder"></div>
              <div style={{width: '100%'}}>
                <div className="mockup-line w-70" style={{background: '#e4e4e7'}}></div>
                <div className="mockup-line w-40"></div>
              </div>
            </div>

            <div className="schedule-item">
               {/* Usando cinza escuro para variar */}
              <div className="avatar-placeholder" style={{background: '#71717a'}}></div>
              <div style={{width: '100%'}}>
                <div className="mockup-line w-100" style={{background: '#e4e4e7'}}></div>
                <div className="mockup-line w-40"></div>
              </div>
            </div>
            
            {/* Card de status flutuante */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              background: '#000',
              color: '#fff',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}>
              ✅ Agendamento Confirmado
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;