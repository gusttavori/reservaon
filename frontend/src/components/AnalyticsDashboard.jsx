import { useState, useEffect } from 'react';
import api from '../services/api'; // IMPORTANTE: Usa o serviço configurado
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cores para o gráfico de Pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // CORREÇÃO: Usa 'api' em vez de axios direto para pegar a URL correta (Render)
      const res = await api.get('/api/analytics');
      setData(res.data);
    } catch (error) {
      console.error("Erro ao carregar analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading-text">Carregando inteligência de dados...</p>;
  if (!data) return <p className="error-text">Sem dados disponíveis para o período.</p>;

  return (
    <div className="analytics-container">
      
      {/* KPI Cards (Indicadores Principais) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Faturamento Total (Mês)</span>
          <h3>R$ {Number(data.totalRevenue).toFixed(2)}</h3>
        </div>
        <div className="kpi-card">
          <span>Agendamentos Concluídos</span>
          <h3>{data.totalAppointments}</h3>
        </div>
        <div className="kpi-card">
          <span>Ticket Médio</span>
          <h3>R$ {data.totalAppointments > 0 ? (data.totalRevenue / data.totalAppointments).toFixed(2) : '0.00'}</h3>
        </div>
      </div>

      <div className="charts-grid">
        
        {/* Gráfico de Serviços (Pizza) */}
        <div className="chart-card">
          <h4>Receita por Serviço</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.revenueByService}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.revenueByService.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Profissionais (Barras) */}
        <div className="chart-card">
          <h4>Desempenho da Equipe (Agendamentos)</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.appsByProfessional}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Atendimentos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Evolução Diária (Linha) - Full Width */}
        <div className="chart-card full-width">
          <h4>Evolução de Faturamento Diário</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="value" name="Faturamento" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;