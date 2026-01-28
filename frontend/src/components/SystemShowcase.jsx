import { useState } from 'react';
import { LayoutDashboard, Calendar, Smartphone, CheckCircle2 } from 'lucide-react';
import dashboardImg from '../assets/dashboard-preview.png'; // Ajuste o caminho se necessário
import catalogImg from '../assets/dashboard-preview.png';     // Ajuste o caminho se necessário
import './SystemShowcase.css';

const FEATURES = [
  {
    id: 'dashboard',
    label: 'Painel de Gestão',
    icon: <LayoutDashboard size={18} />,
    title: 'Gerencie seu negócio em um só lugar',
    description: 'Tenha controle total sobre serviços, preços e horários. Uma interface limpa e intuitiva para você não perder tempo com planilhas.',
    image: dashboardImg,
    points: ['Cadastro ilimitado de serviços', 'Definição de intervalos e duração', 'Visão financeira simplificada']
  },
  {
    id: 'booking',
    label: 'Agendamento Online',
    icon: <Calendar size={18} />,
    title: 'Seu cliente agenda em segundos',
    description: 'Pare de perder tempo no WhatsApp. Envie seu link personalizado e deixe que o cliente escolha o melhor horário disponível.',
    image: catalogImg,
    points: ['Link exclusivo da sua empresa', 'Funciona no celular e computador', 'Disponibilidade atualizada em tempo real']
  },
  {
    id: 'mobile',
    label: 'Responsivo',
    icon: <Smartphone size={18} />,
    title: 'Perfeito em qualquer tela',
    description: 'Seja no computador da recepção ou no celular na palma da mão, o ReservaON se adapta para oferecer a melhor experiência.',
    image: dashboardImg, // Pode reutilizar a img ou colocar um print mobile se tiver
    points: ['Acesso rápido de qualquer lugar', 'Design otimizado para toque', 'Carregamento ultra-rápido']
  }
];

const SystemShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="showcase-section">
      <div className="container">
        
        <div className="showcase-header">
          <h2>Conheça a plataforma por dentro</h2>
          <p>Simples, poderoso e feito para o seu dia a dia.</p>
        </div>

        {/* NAVEGAÇÃO (ABAS) */}
        <div className="showcase-tabs">
          {FEATURES.map((feature, index) => (
            <button 
              key={feature.id}
              className={`tab-btn ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {feature.icon}
              <span>{feature.label}</span>
            </button>
          ))}
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="showcase-content">
          
          {/* Texto Explicativo */}
          <div className="showcase-text animate-fade-in">
            <h3>{FEATURES[activeTab].title}</h3>
            <p>{FEATURES[activeTab].description}</p>
            
            <ul className="feature-points">
              {FEATURES[activeTab].points.map((point, i) => (
                <li key={i}>
                  <CheckCircle2 size={16} color="#2563eb" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Janela Simulada (Browser Window) */}
          <div className="browser-mockup animate-slide-up">
            <div className="browser-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <div className="browser-address-bar">reservaon.com/app</div>
            </div>
            <div className="browser-body">
              <img 
                src={FEATURES[activeTab].image} 
                alt={FEATURES[activeTab].label} 
                className="feature-image"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default SystemShowcase;