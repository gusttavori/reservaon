const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- CONFIGURAÇÕES DA EMPRESA ---
exports.getSettings = async (req, res) => {
  try {
    // Verificação de segurança
    if (!req.userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    // CORREÇÃO: Mudado de findUnique para findFirst
    // Isso evita o erro caso userId não seja @unique no schema
    const company = await prisma.company.findFirst({ 
      where: { userId: req.userId } 
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
    if (!req.userId) return res.status(401).json({ error: "Usuário não autenticado." });

    const { name, openingTime, closingTime, workDays, whatsapp, workSchedule, address, description, logoUrl, category } = req.body;
    
    // 1. Busca a empresa primeiro para pegar o ID
    const existingCompany = await prisma.company.findFirst({
      where: { userId: req.userId }
    });

    if (!existingCompany) return res.status(404).json({ error: "Empresa não encontrada." });

    // 2. Atualiza usando o ID (que o Prisma aceita no update)
    const company = await prisma.company.update({
      where: { id: existingCompany.id },
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
    if (!req.userId) return res.status(401).json({ error: "Usuário não autenticado." });

    // 1. Converter params para Inteiros
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ error: "Mês e Ano são obrigatórios." });
    }

    // CORREÇÃO: findFirst em vez de findUnique
    const company = await prisma.company.findFirst({ 
      where: { userId: req.userId } 
    });
    
    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    // 2. Definir intervalo de datas
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    console.log(`Buscando financeiro: Empresa ${company.id} | ${startDate.toISOString()} até ${endDate.toISOString()}`);

    // 3. Buscar Agendamentos
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
    let expenses = [];
    try {
      expenses = await prisma.expense.findMany({
        where: {
          companyId: company.id,
          date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: 'desc' }
      });
    } catch (dbError) {
      console.error("ERRO CRÍTICO NO PRISMA EXPENSE:", dbError);
      expenses = []; 
    }

    // 5. Cálculos
    let realizedRevenue = 0;
    let potentialRevenue = 0;
    let totalExpenses = 0;

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

    return res.json({
      realizedRevenue,
      potentialRevenue,
      totalExpenses,
      netProfit,
      totalAppointments: appointments.length,
      history,
      expensesHistory: expenses
    });

  } catch (error) {
    console.error("Erro Geral Financeiro:", error);
    return res.status(500).json({ error: "Erro interno ao processar financeiro." });
  }
};

exports.addExpense = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Usuário não autenticado." });

    const { description, amount, date } = req.body;
    
    if (!description || !amount || !date) {
      return res.status(400).json({ error: "Dados incompletos." });
    }

    // CORREÇÃO: findFirst em vez de findUnique
    const company = await prisma.company.findFirst({ 
      where: { userId: req.userId } 
    });

    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    console.log("Tentando salvar despesa:", { description, amount, date });

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
    console.error("Erro ao salvar despesa:", error);
    res.status(500).json({ error: "Erro ao salvar despesa no banco." });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.userId) return res.status(401).json({ error: "Usuário não autenticado." });

    // CORREÇÃO: findFirst
    const company = await prisma.company.findFirst({ 
      where: { userId: req.userId } 
    });
    
    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    // Verifica se a despesa pertence à empresa antes de deletar
    const expense = await prisma.expense.findFirst({ 
      where: { id, companyId: company.id } 
    });

    if (!expense) return res.status(404).json({ error: "Despesa não encontrada." });

    await prisma.expense.delete({ where: { id } });
    res.json({ message: "Despesa removida." });
  } catch (error) {
    console.error("Erro ao deletar despesa:", error);
    res.status(500).json({ error: "Erro ao deletar despesa." });
  }
};