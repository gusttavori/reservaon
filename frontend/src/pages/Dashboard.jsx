import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Calendar, Settings, LogOut, Copy, ExternalLink, Scissors, Users, DollarSign, Briefcase, Lock, Contact, Zap, List, Star, BarChart2, ShieldCheck 
} from 'lucide-react';
import logoImg from '../assets/reservaon.png';
import ServicesManager from '../components/ServicesManager';
import AppointmentsList from '../components/AppointmentsList';
import SettingsManager from '../components/SettingsManager';
import FinancialManager from '../components/FinancialManager';
import TeamManager from '../components/TeamManager';
import WaitingListManager from '../components/WaitingListManager';
import ReviewsManager from '../components/ReviewsManager';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ActivityLogs from '../components/ActivityLogs';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [stats, setStats] = useState({ appointmentsToday: 0, totalRevenue: 0, uniqueClients: 0 });

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!storedUser || !token) {
        navigate('/login');
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);

      if (userData.subscriptionStatus && userData.subscriptionStatus !== 'ACTIVE') {
        setIsActive(false);
      }
      
      if (searchParams.get('success')) {
        setIsActive(true);
        userData.subscriptionStatus = 'ACTIVE';
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard', { replace: true });
      }

      if (isActive) {
        fetchStats(token);
      }
    };

    fetchUserData();
  }, [navigate, searchParams, isActive]);

  const fetchStats = async (token) => {
    try {
      const res = await axios.get('http://localhost:3000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error("Erro ao carregar métricas");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSubscribe = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3000/api/payment/create-checkout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = res.data.url;
    } catch (error) {
      alert("Erro ao iniciar pagamento.");
    }
  };

  const copyLink = () => {
    if (user?.slug) {
      const url = `${window.location.origin}/book/${user.slug}`;
      navigator.clipboard.writeText(url);
      alert("Link copiado! 📋");
    }
  };

  if (!user) return null;

  const isOwner = user.role === 'OWNER';
  const canViewFinancials = isOwner || user.canViewFinancials;
  
  const isBasicPlan = user.planSlug === 'basico';
  const isAdvancedOrPremium = ['avancado', 'premium'].includes(user.planSlug);
  const isPremium = user.planSlug === 'premium';

  const getPlanLabel = (slug) => {
    const labels = {
      'basico': 'Básico',
      'profissional': 'Profissional',
      'avancado': 'Avançado',
      'premium': 'Premium'
    };
    return labels[slug] || 'Plano';
  };

  if (!isActive) {
    return (
      <div className="dashboard-layout" style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{textAlign: 'left', background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '500px'}}>
          <div style={{background: '#eff6ff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'}}>
            <Lock size={40} color="#2563eb" />
          </div>
          <h1 style={{fontSize: '1.8rem', marginBottom: '1rem', color: '#1e293b'}}>Ative sua conta</h1>
          <p style={{color: '#64748b', marginBottom: '2rem', lineHeight: '1.6'}}>
            Para começar a agendar e gerenciar seu negócio, finalize a assinatura do seu plano.
          </p>
          <button onClick={handleSubscribe} style={{background: '#000000', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%'}}>
            Ativar Agora
          </button>
          <div style={{marginTop: '1rem'}}>
             <button onClick={handleLogout} style={{background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline', padding: 0}}>
               Sair
             </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="animate-fade-in">
            <div style={{marginBottom: '2rem', textAlign: 'left'}}>
              <h1 style={{fontSize: '1.8rem', color: '#1e293b', marginBottom: '0.5rem'}}>Olá, {user.name} 👋</h1>
              <p style={{color: '#64748b', margin: 0}}>Gerencie a <strong>{user.company}</strong></p>
            </div>
            
            {user.slug && (
              <div className="share-card" style={{
                background: isBasicPlan ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(135deg, #000000 0%, #5b5b5b 100%)',
                color: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <div className="share-info">
                  <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0'}}>
                    {isBasicPlan ? <Contact size={24} /> : <Zap size={24} />}
                    {isBasicPlan ? "Seu Cartão de Visitas Digital" : "Agendamento Online Ativo 🚀"}
                  </h3>
                  <p style={{margin: 0, opacity: 0.9}}>
                    {isBasicPlan ? "Envie este link para clientes verem seus serviços e entrarem em contato." : "Compartilhe este link e deixe seus clientes agendarem sozinhos 24h por dia."}
                  </p>
                </div>
                <div className="link-box" style={{background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <ExternalLink size={16} color="rgba(255,255,255,0.8)"/>
                  <span className="link-url" style={{fontSize: '0.9rem', color: 'white'}}>reservaon.com/book/{user.slug.slice(0, 10)}...</span>
                  <button onClick={copyLink} className="btn-copy" style={{background: 'white', color: isBasicPlan ? '#1e293b' : '#000000', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <Copy size={16}/> Copiar
                  </button>
                </div>
              </div>
            )}

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon bg-blue"><Calendar size={24} /></div>
                <div><h4>Agendamentos Hoje</h4><p className="stat-value">{stats.appointmentsToday}</p></div>
              </div>
              
              {canViewFinancials && (
                <div className="stat-card">
                  <div className="stat-icon bg-green"><DollarSign size={24} /></div>
                  <div><h4>Faturamento Mês</h4><p className="stat-value">R$ {Number(stats.totalRevenue).toFixed(2)}</p></div>
                </div>
              )}
              
              <div className="stat-card">
                <div className="stat-icon bg-purple"><Users size={24} /></div>
                <div><h4>Clientes Únicos</h4><p className="stat-value">{stats.uniqueClients}</p></div>
              </div>
            </div>

            {isBasicPlan && (
              <div style={{marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left'}}>
                <h4 style={{marginTop: 0, color: '#475569'}}>Acesso Rápido</h4>
                <button onClick={() => setActiveTab('agenda')} style={{background: '#0f172a', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
                  <Calendar size={18}/> Ir para Agenda
                </button>
              </div>
            )}
          </div>
        );

      case 'agenda':
        return <div className="animate-fade-in"><h2 className="section-title">Minha Agenda</h2><AppointmentsList /></div>;
      
      case 'financial':
        if (!canViewFinancials) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        return <div className="animate-fade-in"><h2 className="section-title">Controle Financeiro</h2><FinancialManager /></div>;
      
      case 'team':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito ao proprietário.</h3></div>;
        return <div className="animate-fade-in"><h2 className="section-title">Gerenciar Equipe</h2><TeamManager /></div>;

      case 'waitinglist':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        if (!isAdvancedOrPremium) return (
            <div className="animate-fade-in">
              <h2 className="section-title">Lista de Espera</h2>
              <div className="lock-screen-container">
                <div className="lock-icon-wrapper"><Lock size={30} color="#d97706" /></div>
                <h3 className="lock-title">Recurso Avançado</h3>
                <p className="lock-description">Não perca clientes. Habilite a Lista de Espera Automática nos planos Avançado ou Premium.</p>
                <button onClick={handleSubscribe} style={{background: '#d97706', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Fazer Upgrade</button>
              </div>
            </div>
        );
        return <div className="animate-fade-in"><h2 className="section-title">Lista de Espera</h2><WaitingListManager /></div>;

      case 'reviews':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        if (!isAdvancedOrPremium) return (
            <div className="animate-fade-in">
              <h2 className="section-title">Avaliações do Estabelecimento</h2>
              <div className="lock-screen-container">
                <div className="lock-icon-wrapper"><Lock size={30} color="#d97706" /></div>
                <h3 className="lock-title">Recurso Avançado</h3>
                <p className="lock-description">Saiba o que seus clientes pensam. Habilite o Sistema de Avaliações nos planos Avançado ou Premium.</p>
                <button onClick={handleSubscribe} style={{background: '#d97706', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Fazer Upgrade</button>
              </div>
            </div>
        );
        return <div className="animate-fade-in"><h2 className="section-title">Avaliações</h2><ReviewsManager /></div>;

      case 'analytics':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        if (!isAdvancedOrPremium) return (
            <div className="animate-fade-in">
              <h2 className="section-title">Relatórios e Inteligência</h2>
              <div className="lock-screen-container">
                <div className="lock-icon-wrapper"><Lock size={30} color="#d97706" /></div>
                <h3 className="lock-title">Inteligência de Negócio</h3>
                <p className="lock-description">Descubra quais serviços vendem mais e quem são seus melhores profissionais. Gráficos detalhados exclusivos para Planos Avançado e Premium.</p>
                <button onClick={handleSubscribe} style={{background: '#d97706', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Fazer Upgrade</button>
              </div>
            </div>
        );
        return <div className="animate-fade-in"><h2 className="section-title">Relatórios e Analytics</h2><AnalyticsDashboard /></div>;

      case 'logs':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        if (!isPremium) return (
            <div className="animate-fade-in">
              <h2 className="section-title">Segurança e Auditoria</h2>
              <div className="lock-screen-container">
                <div className="lock-icon-wrapper" style={{background: '#1e293b'}}><ShieldCheck size={30} color="#facc15" /></div>
                <h3 className="lock-title">Recurso Premium</h3>
                <p className="lock-description">Auditoria completa. Saiba exatamente quem alterou preços, excluiu agendamentos ou mudou configurações. Exclusivo para o Plano Premium.</p>
                <button onClick={handleSubscribe} style={{background: '#1e293b', color: '#facc15', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Ser Premium</button>
              </div>
            </div>
        );
        return <div className="animate-fade-in"><h2 className="section-title">Logs de Atividade</h2><ActivityLogs /></div>;

      case 'services':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        return <div className="animate-fade-in"><h2 className="section-title">Gerenciar Serviços</h2><ServicesManager /></div>;

      case 'settings':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        return <div className="animate-fade-in"><h2 className="section-title">Configurações</h2><SettingsManager /></div>;

      default: return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">
          <img src={logoImg} alt="ReservaON Logo" className="brand-logo" />
        </div>
        <nav style={{flex: 1}}>
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /><span>Visão Geral</span>
          </div>
          <div className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`} onClick={() => setActiveTab('agenda')}>
            <Calendar size={20} /><span>Agenda</span>
          </div>
          
          {isOwner && (
            <>
              <div className={`nav-item ${activeTab === 'waitinglist' ? 'active' : ''}`} onClick={() => setActiveTab('waitinglist')}>
                <List size={20} /><span>Lista de Espera</span>
              </div>
              <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                <BarChart2 size={20} /><span>Relatórios</span>
              </div>
              <div className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                <Star size={20} /><span>Avaliações</span>
              </div>
              <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
                <ShieldCheck size={20} /><span>Segurança</span>
              </div>
            </>
          )}

          {canViewFinancials && (
            <div className={`nav-item ${activeTab === 'financial' ? 'active' : ''}`} onClick={() => setActiveTab('financial')}>
              <DollarSign size={20} /><span>Financeiro</span>
            </div>
          )}
          
          {isOwner && (
            <>
              <div className={`nav-item ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
                <Users size={20} /><span>Equipe</span>
              </div>
              <div className={`nav-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
                <Briefcase size={20} /><span>Serviços</span>
              </div>
              <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                <Settings size={20} /><span>Configurações</span>
              </div>
            </>
          )}
        </nav>
        
        <div className="user-mini-profile">
          <div className="avatar">{user.name.charAt(0)}</div>
          <div style={{flex: 1, overflow: 'hidden'}}>
            <p style={{margin: 0, fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap'}}>{user.name}</p>
            <p style={{margin: 0, fontSize: '0.75rem', color: '#94a3b8'}}>
              {user.role === 'OWNER' ? 'Dono' : 'Equipe'} • {getPlanLabel(user.planSlug)}
            </p>
          </div>
          <button onClick={handleLogout} title="Sair" style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;