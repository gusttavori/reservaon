import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
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
  const [isActive, setIsActive] = useState(false);
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

      if (userData.subscriptionStatus === 'ACTIVE' || userData.subscriptionStatus === 'TRIAL') {
        setIsActive(true);
        fetchStats();
      } else {
        setIsActive(false);
      }
      
      if (searchParams.get('success')) {
        setIsActive(true);
        userData.subscriptionStatus = 'ACTIVE';
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard', { replace: true });
        fetchStats();
      }
    };

    fetchUserData();
  }, [navigate, searchParams]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/dashboard/stats');
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
      const res = await api.post('/api/payment/create-checkout');
      window.location.href = res.data.url;
    } catch (error) {
      console.error(error);
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
  const canViewFinancials = isOwner || user.canViewFinancials === true;
  const canManageAgenda = isOwner || user.canManageAgenda === true;
  
  const isBasicPlan = user.planSlug === 'basico';
  const isAdvancedOrPremium = ['avancado', 'premium'].includes(user.planSlug);
  const isPremium = user.planSlug === 'premium';

  if (!isActive) {
    return (
      <div className="dashboard-layout" style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{textAlign: 'left', background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '500px'}}>
          <div style={{background: '#eff6ff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'}}>
            <Lock size={40} color="#2563eb" />
          </div>
          <h1 style={{fontSize: '1.8rem', marginBottom: '1rem', color: '#1e293b'}}>Ative sua conta</h1>
          <p style={{color: '#64748b', marginBottom: '2rem', lineHeight: '1.6'}}>
            Sua assinatura expirou ou o período de teste acabou.
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
            <div className="dashboard-welcome">
              <h1>Olá, {user.name} 👋</h1>
              <p>Gerencie a <strong>{user.company}</strong></p>
            </div>
            
            {user.slug && (
              <div className={`share-card ${isBasicPlan ? 'basic' : 'premium'}`}>
                <div className="share-info">
                  <h3>
                    {isBasicPlan ? <Contact size={24} /> : <Zap size={24} />}
                    {isBasicPlan ? "Seu Cartão Digital" : "Agendamento Online Ativo 🚀"}
                  </h3>
                  <p>
                    {isBasicPlan 
                      ? "Envie este link para clientes verem seus serviços." 
                      : "Compartilhe este link e deixe seus clientes agendarem sozinhos 24h por dia."}
                  </p>
                </div>

                <div className="link-box-container">
                  <div className="link-display">
                    <ExternalLink size={16} className="link-icon"/>
                    <span className="link-url">reservaon.com/book/{user.slug}</span>
                  </div>
                  <button onClick={copyLink} className="btn-copy">
                    <Copy size={16}/> <span>Copiar</span>
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
          </div>
        );

      case 'agenda':
        if (!canManageAgenda) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        return <div className="animate-fade-in"><h2 className="section-title">Minha Agenda</h2><AppointmentsList /></div>;
      
      case 'financial':
        if (!canViewFinancials) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        return <div className="animate-fade-in"><h2 className="section-title">Controle Financeiro</h2><FinancialManager /></div>;
      
      case 'team':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito ao proprietário.</h3></div>;
        return <div className="animate-fade-in"><h2 className="section-title">Gerenciar Equipe</h2><TeamManager /></div>;

      case 'waitinglist':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        if (!isAdvancedOrPremium) return <LockScreen title="Lista de Espera" />;
        return <div className="animate-fade-in"><h2 className="section-title">Lista de Espera</h2><WaitingListManager /></div>;

      case 'reviews':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        if (!isAdvancedOrPremium) return <LockScreen title="Avaliações" />;
        return <div className="animate-fade-in"><h2 className="section-title">Avaliações</h2><ReviewsManager /></div>;

      case 'analytics':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        if (!isAdvancedOrPremium) return <LockScreen title="Analytics" />;
        return <div className="animate-fade-in"><h2 className="section-title">Relatórios e Analytics</h2><AnalyticsDashboard /></div>;

      case 'logs':
        if (!isOwner) return <div className="animate-fade-in"><h3>Acesso restrito.</h3></div>;
        if (!isPremium) return <LockScreen title="Logs" premium />;
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

  const LockScreen = ({ title, premium }) => (
    <div className="animate-fade-in">
      <h2 className="section-title">{title}</h2>
      <div className="lock-screen-container">
        <div className="lock-icon-wrapper" style={premium ? {background: '#1e293b'} : {}}><Lock size={30} color={premium ? "#facc15" : "#d97706"} /></div>
        <h3 className="lock-title">Recurso {premium ? 'Premium' : 'Avançado'}</h3>
        <p className="lock-description">Faça upgrade do seu plano para acessar {title}.</p>
        <button onClick={handleSubscribe} style={{background: premium ? '#1e293b' : '#d97706', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Fazer Upgrade</button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR ORIGINAL RESTAURADA */}
      <aside className="sidebar">
        <div className="brand-container">
           {/* LOGO SIMPLIFICADA SEM CONTAINER REDONDO (COMO PEDIDO 'ORIGINAL') */}
           <img src={logoImg} alt="ReservaON Logo" className="brand-logo" />
        </div>
        
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /><span>Visão Geral</span>
          </div>
          
          {canManageAgenda && (
            <div className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`} onClick={() => setActiveTab('agenda')}>
              <Calendar size={20} /><span>Agenda</span>
            </div>
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
              <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                <Settings size={20} /><span>Configurações</span>
              </div>
            </>
          )}
        </nav>
        
        <div className="user-mini-profile">
          <div className="avatar">{user.name.charAt(0)}</div>
          <div className="user-info-text">
            <p className="user-name">{user.name}</p>
            <p className="user-role">{user.role === 'OWNER' ? 'Dono' : 'Equipe'}</p>
          </div>
          <button onClick={handleLogout} title="Sair" className="btn-logout">
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