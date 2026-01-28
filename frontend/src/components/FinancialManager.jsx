import { useState, useEffect } from 'react';
import api from '../services/api'; // Importante
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import './FinancialManager.css';

const FinancialManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, profit: 0 });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      // Busca lançamentos (receitas vêm dos agendamentos, despesas manuais)
      const res = await api.get('/api/financial/summary');
      setSummary(res.data.summary);
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error("Erro financeiro", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    try {
      await api.post('/api/financial/expense', {
        description: newExpense.description,
        amount: parseFloat(newExpense.amount)
      });
      
      setNewExpense({ description: '', amount: '' });
      fetchFinancials(); // Recarrega
    } catch (error) {
      alert("Erro ao salvar despesa.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remover este lançamento?")) return;
    try {
      await api.delete(`/api/financial/${id}`);
      fetchFinancials();
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  if (loading) return <p>Carregando financeiro...</p>;

  return (
    <div className="financial-container">
      {/* Cards de Resumo */}
      <div className="financial-cards">
        <div className="fin-card income">
          <div className="fin-icon"><TrendingUp size={24}/></div>
          <div><p>Receitas</p><h3>R$ {summary.income.toFixed(2)}</h3></div>
        </div>
        <div className="fin-card expense">
          <div className="fin-icon"><TrendingDown size={24}/></div>
          <div><p>Despesas</p><h3>R$ {summary.expenses.toFixed(2)}</h3></div>
        </div>
        <div className="fin-card profit">
          <div className="fin-icon"><DollarSign size={24}/></div>
          <div><p>Lucro Líquido</p><h3>R$ {summary.profit.toFixed(2)}</h3></div>
        </div>
      </div>

      <div className="financial-grid">
        {/* Formulário de Despesa */}
        <div className="expense-form-card">
          <h4>Registrar Despesa</h4>
          <form onSubmit={handleAddExpense}>
            <input 
              type="text" placeholder="Descrição (ex: Luz, Água)" 
              className="fin-input" required
              value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})}
            />
            <input 
              type="number" placeholder="Valor (R$)" 
              className="fin-input" required
              value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
            />
            <button type="submit" className="btn-add-expense"><Plus size={18}/> Adicionar</button>
          </form>
        </div>

        {/* Lista de Transações */}
        <div className="transactions-list">
          <h4>Últimos Lançamentos</h4>
          {transactions.length === 0 ? <p className="empty-text">Sem movimentações.</p> : (
            <ul>
              {transactions.map(t => (
                <li key={t.id} className={`trans-item ${t.type}`}>
                  <div className="trans-info">
                    <span className="trans-desc">{t.description}</span>
                    <span className="trans-date">{new Date(t.date).toLocaleDateString()}</span>
                  </div>
                  <div className="trans-val-box">
                    <span className="trans-val">
                      {t.type === 'expense' ? '-' : '+'} R$ {Number(t.amount).toFixed(2)}
                    </span>
                    {t.type === 'expense' && (
                      <button onClick={() => handleDelete(t.id)} className="btn-del-mini"><Trash2 size={14}/></button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialManager;