import { useState } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  LayoutDashboard, 
  Search, 
  MousePointer, 
  Clock 
} from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('business');

  const businessSteps = [
    {
      icon: <LayoutDashboard size={26} />,
      title: "Crie sua agenda",
      desc: "Configure seus horários de atendimento e personalize seu perfil em minutos."
    },
    {
      icon: <Users size={26} />,
      title: "Cadastre equipe",
      desc: "Adicione os seus colaboradores e gerencie permissões e serviços individuais."
    },
    {
      icon: <Calendar size={26} />,
      title: "Receba agendamentos",
      desc: "Compartilhe o seu link e deixe que os clientes marquem sozinhos 24/7."
    },
    {
      icon: <DollarSign size={26} />,
      title: "Controle financeiro",
      desc: "Acompanhe o faturamento diário e mensal diretamente no painel."
    }
  ];

  const clientSteps = [
    {
      icon: <Search size={26} />,
      title: "Encontre empresas",
      desc: "Busque por barbearias, clínicas, salões e profissionais próximos a si."
    },
    {
      icon: <MousePointer size={26} />,
      title: "Escolha o serviço",
      desc: "Veja os serviços disponíveis, preços e avaliações de outros clientes."
    },
    {
      icon: <Clock size={26} />,
      title: "Agende em segundos",
      desc: "Selecione o melhor horário e confirme. Receba lembretes automáticos."
    }
  ];

  const steps = activeTab === 'business' ? businessSteps : clientSteps;

  return (
    <section className="how-it-works" id="funcionalidades">
      <div className="container">
        <div className="section-header">
          {/* KICKER (Texto pequeno acima) */}
          <span className="section-kicker">COMO O RESERVAON FUNCIONA?</span>
          
          {/* TÍTULO PRINCIPAL */}
          <h2 className="section-title">
            A solução completa para organizar seu negócio.
          </h2>
          
          {/* SUBTÍTULO */}
          <p className="section-subtitle">
            Gerencie sua agenda, fidelize clientes e cresça com ferramentas simples e poderosas.
          </p>
          
          {/* TOGGLE */}
          <div className="toggle-container">
            <div className="toggle-bg">
              <button 
                className={`toggle-btn ${activeTab === 'business' ? 'active' : ''}`}
                onClick={() => setActiveTab('business')}
              >
                Para Empresas
              </button>
              <button 
                className={`toggle-btn ${activeTab === 'client' ? 'active' : ''}`}
                onClick={() => setActiveTab('client')}
              >
                Para Clientes
              </button>
            </div>
          </div>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div className="step-card" key={index}>
              <div className="step-icon-wrapper">
                {step.icon}
              </div>
              <span className="step-number">PASSO 0{index + 1}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;