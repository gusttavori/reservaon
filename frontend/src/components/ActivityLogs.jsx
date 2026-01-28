import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Edit, Trash2, PlusCircle, Settings, User } from 'lucide-react';
import './ActivityLogs.css';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (action) => {
    if (action.includes('DELETE')) return <Trash2 size={16} color="#ef4444"/>;
    if (action.includes('CREATE')) return <PlusCircle size={16} color="#10b981"/>;
    if (action.includes('UPDATE')) return <Edit size={16} color="#3b82f6"/>;
    if (action.includes('SETTINGS')) return <Settings size={16} color="#64748b"/>;
    return <ShieldAlert size={16} color="#64748b"/>;
  };

  if (loading) return <p>Carregando registros de segurança...</p>;
  if (error) return <p>Erro ao carregar logs. Verifique seu plano.</p>;

  return (
    <div className="logs-container">
      <div className="logs-header-box">
        <h3>Histórico de Auditoria</h3>
        <p>Rastreabilidade completa de ações críticas no sistema.</p>
      </div>

      <div className="timeline">
        {logs.length === 0 ? (
          <p className="empty-logs">Nenhuma atividade registrada recentemente.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="timeline-item">
              <div className="timeline-icon">
                {getIcon(log.action)}
              </div>
              <div className="timeline-content">
                <div className="timeline-top">
                  <span className="log-action">{log.action.replace('_', ' ')}</span>
                  <span className="log-date">
                    {new Date(log.createdAt).toLocaleDateString()} às {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="log-details">{log.details}</p>
                <div className="log-user">
                  <User size={12} style={{marginRight: '4px'}}/>
                  Feito por: <strong>{log.user?.name || 'Sistema'}</strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;