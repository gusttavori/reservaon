const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logAction } = require('../utils/logger');

exports.getSettings = async (req, res) => {
  const companyId = req.user.companyId;
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  
  if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

  res.json({
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
};

exports.updateSettings = async (req, res) => {
  const companyId = req.user.companyId;
  const userId = req.user.userId;
  // Recebe category
  const { openingTime, closingTime, workDays, whatsapp, workSchedule, address, description, logoUrl, category } = req.body;

  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { 
        openingTime, closingTime, workDays, whatsapp, workSchedule, address, description, logoUrl,
        category // <--- Salva categoria
      }
    });

    await logAction(companyId, userId, 'UPDATE_SETTINGS', 'Atualizou as configurações.');
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar configurações." });
  }
};

exports.getFinancialStats = async (req, res) => {
  const companyId = req.user.companyId;
  const { month, year } = req.query;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const appointments = await prisma.appointment.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      },
      include: { service: true },
      orderBy: { date: 'desc' }
    });

    const expenses = await prisma.expense.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'desc' }
    });

    let realizedRevenue = 0;
    let potentialRevenue = 0;
    let totalExpenses = 0;

    appointments.forEach(app => {
      const price = Number(app.service.price);
      if (app.status === 'COMPLETED') {
        realizedRevenue += price;
      } else {
        potentialRevenue += price;
      }
    });

    expenses.forEach(exp => {
      totalExpenses += Number(exp.amount);
    });

    const netProfit = realizedRevenue - totalExpenses;

    return res.json({
      realizedRevenue,
      potentialRevenue,
      totalExpenses,
      netProfit,
      totalAppointments: appointments.length,
      history: appointments,
      expensesHistory: expenses
    });

  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar financeiro." });
  }
};

exports.addExpense = async (req, res) => {
  const companyId = req.user.companyId;
  const { description, amount, date } = req.body;

  try {
    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        companyId
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar despesa." });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.companyId;

  try {
    const expense = await prisma.expense.findFirst({ where: { id, companyId } });
    if (!expense) return res.status(404).json({ error: "Despesa não encontrada." });

    await prisma.expense.delete({ where: { id } });
    res.json({ message: "Despesa removida." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar despesa." });
  }
};