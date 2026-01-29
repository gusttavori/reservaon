const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- CONFIGURAÇÕES DA EMPRESA ---
exports.getSettings = async (req, res) => {
  try {
    // CORREÇÃO: Usamos req.companyId direto (vem do token)
    if (!req.companyId) {
      return res.status(401).json({ error: "Token inválido (sem empresa vinculada)." });
    }

    const company = await prisma.company.findUnique({ 
      where: { id: req.companyId } 
    });
    
    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    res.json({
      name: company.name,
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
    console.error("Erro getSettings:", error);
    res.status(500).json({ error: "Erro ao buscar configurações." });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    if (!req.companyId) return res.status(401).json({ error: "Acesso negado." });

    const { name, openingTime, closingTime, workDays, whatsapp, workSchedule, address, description, logoUrl, category } = req.body;
    
    // CORREÇÃO: Atualiza direto pelo ID da empresa
    const company = await prisma.company.update({
      where: { id: req.companyId },
      data: { name, openingTime, closingTime, workDays, whatsapp, workSchedule, address, description, logoUrl, category }
    });
    
    res.json(company);
  } catch (error) {
    console.error("Erro updateSettings:", error);
    res.status(500).json({ error: "Erro ao atualizar configurações." });
  }
};

// --- FINANCEIRO (CORRIGIDO) ---

exports.getFinancialStats = async (req, res) => {
  try {
    console.log("🔍 FinancialStats: Iniciando para Empresa ID:", req.companyId);

    if (!req.companyId) {
      return res.status(401).json({ error: "ID da empresa não encontrado no token." });
    }

    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: "Mês e Ano obrigatórios." });

    // Datas
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    // Agendamentos
    const appointments = await prisma.appointment.findMany({
      where: {
        companyId: req.companyId, // <--- Correção aqui
        date: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      },
      include: { service: true },
      orderBy: { date: 'desc' }
    });

    // Despesas
    let expenses = [];
    try {
      expenses = await prisma.expense.findMany({
        where: {
          companyId: req.companyId, // <--- Correção aqui
          date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: 'desc' }
      });
    } catch (dbError) {
      console.error("⚠️ Erro tabela expense (ainda não existe?):", dbError.message);
      expenses = []; 
    }

    // Cálculos
    let realizedRevenue = 0;
    let potentialRevenue = 0;
    let totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const history = appointments.map(app => {
      const price = Number(app.service.price);
      if (['COMPLETED', 'CONFIRMED'].includes(app.status)) realizedRevenue += price;
      else potentialRevenue += price;
      return app;
    });

    const netProfit = realizedRevenue - totalExpenses;

    res.json({
      realizedRevenue,
      potentialRevenue,
      totalExpenses,
      netProfit,
      totalAppointments: appointments.length,
      history,
      expensesHistory: expenses
    });

  } catch (error) {
    console.error("🔴 Erro Geral Financeiro:", error);
    res.status(500).json({ error: "Erro interno no financeiro." });
  }
};

exports.addExpense = async (req, res) => {
  try {
    if (!req.companyId) return res.status(401).json({ error: "Acesso negado." });

    const { description, amount, date } = req.body;
    
    if (!description || !amount || !date) {
      return res.status(400).json({ error: "Dados incompletos." });
    }

    console.log("Salvando despesa para empresa:", req.companyId);

    // CORREÇÃO: Usa companyId direto
    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        companyId: req.companyId
      }
    });
    
    res.status(201).json(expense);
  } catch (error) {
    console.error("Erro ao salvar despesa:", error);
    res.status(500).json({ error: "Erro ao salvar despesa no banco." });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.companyId) return res.status(401).json({ error: "Acesso negado." });

    // Verifica se a despesa é desta empresa
    const expense = await prisma.expense.findFirst({ 
      where: { 
        id, 
        companyId: req.companyId 
      } 
    });

    if (!expense) return res.status(404).json({ error: "Despesa não encontrada." });

    await prisma.expense.delete({ where: { id } });
    res.json({ message: "Despesa removida." });
  } catch (error) {
    console.error("Erro ao deletar despesa:", error);
    res.status(500).json({ error: "Erro ao deletar despesa." });
  }
};