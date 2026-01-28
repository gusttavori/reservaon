import { 
  CalendarCheck, 
  Users, 
  TrendingUp, 
  FileText, 
  Globe, 
  MessageCircle 
} from 'lucide-react';
import './Features.css';

const Features = () => {
  const featuresList = [
    {
      icon: <CalendarCheck size={24} strokeWidth={1.5} />,
      title: "Agenda Inteligente",
      desc: "Evita conflitos de horário automaticamente. Bloqueie horários de almoço e feriados com um clique."
    },
    {
      icon: <Users size={24} strokeWidth={1.5} />,
      title: "Múltiplos Profissionais",
      desc: "Ideal para barbearias e salões. Cada profissional tem a sua própria agenda e acesso limitado."
    },
    {
      icon: <TrendingUp size={24} strokeWidth={1.5} />,
      title: "Controle Financeiro",
      desc: "Saiba exatamente quanto lucrou no dia. Gráficos simples de receitas e despesas."
    },
    {
      icon: <FileText size={24} strokeWidth={1.5} />,
      title: "Relatórios Detalhados",
      desc: "Descubra quais serviços são mais rentáveis e quais clientes agendam com mais frequência."
    },
    {
      icon: <Globe size={24} strokeWidth={1.5} />,
      title: "Página de Agendamento",
      desc: "Um link exclusivo (reservaon.com/suaempresa) para colocar na bio do Instagram."
    },
    {
      icon: <MessageCircle size={24} strokeWidth={1.5} />,
      title: "Lembretes Automáticos",
      desc: "Reduza o 'bolo' (no-show). O sistema envia lembretes para o cliente antes do horário."
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <div className="features-header">
          <span className="features-kicker">RECURSOS</span>
          <h2 className="features-title">Tudo o que precisa para crescer</h2>
          <p className="features-subtitle">
            Ferramentas poderosas numa interface que qualquer pessoa consegue usar.
          </p>
        </div>

        <div className="features-grid">
          {featuresList.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;