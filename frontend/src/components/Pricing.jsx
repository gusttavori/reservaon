import { useState } from 'react';
import { Check, X, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, semesterly, yearly

  // Dados exatos retirados das imagens do Stripe
  const plans = [
    {
      name: "Básico",
      slug: "basico",
      desc: "Seu caderno digital. Organize sua agenda e finanças manualmente.",
      prices: {
        monthly: 19.90,
        semesterly: null, // Não existe na imagem
        yearly: 179.90
      },
      features: [
        "1 Profissional",
        "Agenda de Gestão Interna",
        "Controle Financeiro Completo",
        "Relatórios Básicos"
      ],
      disabledFeatures: [
        "Link de Agendamento Público", 
        "Lembretes via WhatsApp",
        "Gestão de Comissões"
      ],
      highlight: false
    },
    {
      name: "Profissional",
      slug: "profissional",
      desc: "Automatize tudo. Deixe seu cliente agendar sozinho 24h por dia.",
      prices: {
        monthly: 29.90,
        semesterly: null, // Não existe na imagem
        yearly: 269.90
      },
      features: [
        "Até 3 Profissionais",
        "Link de Agendamento Público",
        "Lembretes Automáticos (WhatsApp)",
        "Controle Financeiro Completo",
        "Gestão de Clientes (CRM)"
      ],
      disabledFeatures: ["Gestão de Comissões"],
      highlight: true
    },
    {
      name: "Avançado",
      slug: "avancado",
      desc: "Para equipes em crescimento que precisam de gestão detalhada.",
      prices: {
        monthly: 44.90,
        semesterly: 249.90,
        yearly: 399.90
      },
      features: [
        "Até 5 Profissionais",
        "Tudo do Profissional",
        "Cálculo Automático de Comissões",
        "Relatórios de Desempenho",
        "Múltiplas Agendas"
      ],
      disabledFeatures: ["API de Integração"],
      highlight: false
    },
    {
      name: "Premium",
      slug: "premium",
      desc: "A solução definitiva para grandes redes e franquias.",
      prices: {
        monthly: 69.90,
        semesterly: 379.90,
        yearly: 629.90
      },
      features: [
        "Profissionais Ilimitados",
        "Tudo do Avançado",
        "API de Integração",
        "Gerente de Conta Dedicado",
        "Treinamento da Equipe"
      ],
      disabledFeatures: [],
      highlight: false
    }
  ];

  // Helper para calcular o preço a ser exibido (Divisão visual)
  const getDisplayPrice = (plan) => {
    // Se o plano não tiver opção semestral e o ciclo for semestral, fallback para mensal
    if (billingCycle === 'semesterly' && !plan.prices.semesterly) {
      return plan.prices.monthly.toFixed(2).replace('.', ',');
    }

    let total = plan.prices[billingCycle];
    let divisor = 1;

    if (billingCycle === 'semesterly') divisor = 6;
    if (billingCycle === 'yearly') divisor = 12;

    return (total / divisor).toFixed(2).replace('.', ',');
  };

  // Helper para texto de cobrança (ex: Cobrado R$ 179,90 anualmente)
  const getBilledText = (plan) => {
    if (billingCycle === 'monthly') return 'Cobrado mensalmente';
    
    // Fallback para planos sem semestral
    if (billingCycle === 'semesterly' && !plan.prices.semesterly) {
      return 'Opção semestral indisponível. Preço mensal.';
    }

    const total = plan.prices[billingCycle].toFixed(2).replace('.', ',');
    const period = billingCycle === 'semesterly' ? 'a cada 6 meses' : 'anualmente';
    
    return `Cobrado R$ ${total} ${period}`;
  };

  const getFidelidadeText = () => {
    switch (billingCycle) {
      case 'monthly': return 'Sem fidelidade. Cancele quando quiser.';
      case 'semesterly': return 'Fidelidade mínima de 3 meses (50%).';
      case 'yearly': return 'Fidelidade mínima de 6 meses (50%).';
      default: return '';
    }
  };

  return (
    <section className="pricing-section" id="planos">
      <div className="container">
        <div className="pricing-header">
          <span className="pricing-badge">PLANOS FLEXÍVEIS</span>
          <h2>Escolha a evolução do seu negócio</h2>
          
          {/* SELETOR DE CICLO */}
          <div className="cycle-container">
            <div className="cycle-selector">
              <button 
                className={`cycle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Mensal
              </button>
              <button 
                className={`cycle-btn ${billingCycle === 'semesterly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('semesterly')}
              >
                Semestral
              </button>
              <button 
                className={`cycle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('yearly')}
              >
                Anual <span className="discount-tag">-20%</span>
              </button>
            </div>
            <p className="fidelidade-alert">
              <Info size={14} style={{marginRight: 4, display: 'inline-block', verticalAlign: 'middle'}}/>
              {getFidelidadeText()}
            </p>
          </div>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`plan-card ${plan.highlight ? 'highlighted' : ''}`}
            >
              {plan.highlight && (
                <div className="popular-tag">RECOMENDADO</div>
              )}
              
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="currency">R$</span>
                  {getDisplayPrice(plan)}
                  <span className="period">/mês</span>
                </div>
                <p className="billed-text">{getBilledText(plan)}</p>
                <p className="plan-desc">{plan.desc}</p>
              </div>

              {/* URL inclui o ciclo escolhido. Se o plano não suportar semestral, força mensal */}
              <Link 
                to={`/register?plan=${plan.slug}&cycle=${(!plan.prices.semesterly && billingCycle === 'semesterly') ? 'monthly' : billingCycle}`} 
                className="btn-wrapper"
              >
                <button className={`btn-plan ${plan.highlight ? 'primary' : 'secondary'}`}>
                  {plan.highlight ? 'Assinar Profissional' : 'Começar Agora'}
                </button>
              </Link>

              <div className="plan-features">
                <p className="features-label">O que está incluído:</p>
                <ul>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="feature-item">
                      <div className="icon-wrapper check">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.disabledFeatures.map((feature, idx) => (
                    <li key={`d-${idx}`} className="feature-item disabled">
                      <div className="icon-wrapper cross">
                        <X size={14} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;