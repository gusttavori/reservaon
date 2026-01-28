const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Se você não tiver o utils/logger, pode remover a linha abaixo e a chamada logAction
const { logAction } = require('../utils/logger'); 

// --- CONFIGURAÇÕES DA EMPRESA ---

exports.getSettings = async (req, res) => {
  try {
    // Busca a empresa pelo ID do usuário logado (garantido pelo token)
    const company = await prisma.company.findUnique({ 
      where: { userId: req.userId } 
    });
    
    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    res.json({
      name: company.name, // Adicionado para exibir o nome no formulário
      category: company.category,
      openingTime: company.openingTime,
      closingTime: company.closingTime,
      workDays: company.workDays,
      whatsapp: company.whatsapp,
      workSchedule: company.workSchedule,
      address: company.address,
      description: company.description,
      logoUrl: company.logoUrl
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar configurações." });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { name, openingTime, closingTime, workDays, whatsapp, workSchedule, address, description, logoUrl, category } = req.body;

    // Atualiza buscando pelo userId
    const company = await prisma.company.update({
      where: { userId: req.userId },
      data: { 
        name,
        openingTime, closingTime, workDays, whatsapp, workSchedule, address, description, logoUrl, category
      }
    });

    // Tenta registrar log, se falhar não trava a requisição
    try {
      if (typeof logAction === 'function') {
        await logAction(company.id, req.userId, 'UPDATE_SETTINGS', 'Atualizou as configurações.');
      }
    } catch (logError) {
      console.warn("Falha ao registrar log:", logError.message);
    }

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar configurações." });
  }
};

// --- FINANCEIRO ---

exports.getFinancialStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.userId;

    // 1. Encontrar a empresa do usuário
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    // 2. Definir intervalo de datas
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 3. Buscar Agendamentos (Receitas)
    const appointments = await prisma.appointment.findMany({
      where: {
        companyId: company.id,
        date: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      },
      include: { service: true },
      orderBy: { date: 'desc' }
    });

    // 4. Buscar Despesas
    const expenses = await prisma.expense.findMany({
      where: {
        companyId: company.id,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'desc' }
    });

    // 5. Calcular Totais
    let realizedRevenue = 0; // Pago/Concluído
    let potentialRevenue = 0; // Pendente
    let totalExpenses = 0;

    // Mapeia agendamentos para o histórico e soma valores
    const history = appointments.map(app => {
      const price = Number(app.service.price);
      if (['COMPLETED', 'CONFIRMED'].includes(app.status)) {
        realizedRevenue += price;
      } else {
        potentialRevenue += price;
      }
      return app;
    });

    expenses.forEach(exp => {
      totalExpenses += Number(exp.amount);
    });

    const netProfit = realizedRevenue - totalExpenses;

    // Retorna JSON no formato que o FinancialManager espera
    return res.json({
      realizedRevenue,
      potentialRevenue,
      totalExpenses,
      netProfit,
      totalAppointments: appointments.length,
      history,        // Lista de agendamentos
      expensesHistory: expenses // Lista de despesas
    });

  } catch (error) {
    console.error("Erro financeiro:", error);
    return res.status(500).json({ error: "Erro ao buscar financeiro." });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { description, amount, date } = req.body;
    
    // Busca a empresa para vincular a despesa
    const company = await prisma.company.findUnique({ where: { userId: req.userId } });
    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        companyId: company.id
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar despesa." });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  
  try {
    const company = await prisma.company.findUnique({ where: { userId: req.userId } });
    
    // Garante que a despesa pertence à empresa do usuário logado
    const expense = await prisma.expense.findFirst({ 
      where: { id, companyId: company.id } 
    });

    if (!expense) return res.status(404).json({ error: "Despesa não encontrada." });

    await prisma.expense.delete({ where: { id } });
    res.json({ message: "Despesa removida." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar despesa." });
  }
};