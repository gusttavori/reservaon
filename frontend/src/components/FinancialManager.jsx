import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, TrendingDown, Clock, Plus, Trash2, Wallet } from 'lucide-react';
import './FinancialManager.css'; // Importando o CSS novo

const FinancialManager = () => {
  const [stats, setStats] = useState({ 
    realizedRevenue: 0, 
    potentialRevenue: 0, 
    totalExpenses: 0,
    netProfit: 0,
    totalAppointments: 0, 
    history: [],
    expensesHistory: []
  });
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(() => {
    fetchFinancials();
  }, [month, year]);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/company/financials?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error("Erro financeiro", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/company/expenses', expenseForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Despesa registrada!");
      setExpenseForm({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      setShowExpenseForm(false);
      fetchFinancials();
    } catch (error) {
      alert("Erro ao salvar despesa.");
    }
  };

  const handleDeleteExpense = async (id) => {
    if(!confirm("Remover esta despesa?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/company/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFinancials();
    } catch (error) {
      alert("Erro ao deletar.");
    }
  };

  return (
    <div className="financial-container">
      
      {/* 1. Header e Filtros */}
      <div className="financial-header">
        <div className="filters">
          <select value={month} onChange={e => setMonth(e.target.value)} className="select-custom">
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('pt-BR', {month: 'long'})}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="select-custom">
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        
        <button 
          onClick={() => setShowExpenseForm(!showExpenseForm)}
          className="btn-expense"
        >
          <Plus size={18} /> Registrar Saída
        </button>
      </div>

      {/* 2. Formulário de Despesa (Expansível) */}
      {showExpenseForm && (
        <div className="expense-form-container">
          <h4 className="form-title">Nova Despesa / Custo</h4>
          <form onSubmit={handleAddExpense} className="expense-form">
            <div className="form-group grow">
              <label className="input-label">Descrição</label>
              <input 
                type="text" required placeholder="Ex: Aluguel, Luz, Produtos..." 
                value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                className="input-field"
              />
            </div>
            <div className="form-group normal">
              <label className="input-label">Valor (R$)</label>
              <input 
                type="number" step="0.01" required placeholder="0,00" 
                value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                className="input-field"
              />
            </div>
            <div className="form-group normal">
              <label className="input-label">Data</label>
              <input 
                type="date" required 
                value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-save">
              Salvar
            </button>
          </form>
        </div>
      )}

      {/* 3. Cards de KPIs */}
      <div className="stats-grid">
        
        {/* Entradas (Realizadas) */}
        <div className="stat-card green">
          <div className="icon-box">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h4>Entradas (Recebido)</h4>
            <p className="stat-value">
              R$ {stats.realizedRevenue.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {/* Saídas */}
        <div className="stat-card red">
          <div className="icon-box">
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <h4>Saídas (Despesas)</h4>
            <p className="stat-value">
              - R$ {stats.totalExpenses.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className="stat-card blue">
          <div className="icon-box">
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <h4>Lucro Líquido</h4>
            <p className="stat-value">
              R$ {stats.netProfit.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {/* A Receber */}
        <div className="stat-card orange">
          <div className="icon-box">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>Previsão (A Receber)</h4>
            <p className="stat-value">
              R$ {stats.potentialRevenue.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Listas (Extrato Misto) */}
      <div className="transactions-grid">
        
        {/* Lista de Entradas */}
        <div>
          <h3 className="list-header">Últimas Entradas</h3>
          <div className="transaction-list">
            {stats.history.length === 0 ? (
              <div className="empty-state">Sem entradas neste mês.</div>
            ) : (
              stats.history.slice(0, 5).map(item => (
                <div key={item.id} className={`transaction-item income ${item.status !== 'COMPLETED' ? 'pending' : ''}`}>
                  <div className="t-info">
                    <strong>{item.service.name} {item.status === 'COMPLETED' ? '' : '(Pendente)'}</strong>
                    <span>
                      {new Date(item.date).toLocaleDateString('pt-BR')} • {item.customerName}
                    </span>
                  </div>
                  <div className="t-amount">
                    + R$ {Number(item.service.price).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lista de Saídas */}
        <div>
          <h3 className="list-header">Últimas Despesas</h3>
          <div className="transaction-list">
            {stats.expensesHistory.length === 0 ? (
              <div className="empty-state">Sem despesas registradas.</div>
            ) : (
              stats.expensesHistory.map(item => (
                <div key={item.id} className="transaction-item expense">
                  <div className="t-info">
                    <strong>{item.description}</strong>
                    <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span className="t-amount">
                      - R$ {Number(item.amount).toFixed(2)}
                    </span>
                    <button 
                      onClick={() => handleDeleteExpense(item.id)}
                      className="btn-delete"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinancialManager;