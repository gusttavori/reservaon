const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  const companyId = req.user.companyId;

  try {
    const now = new Date();
    
    // 1. Agendamentos de Hoje
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const appointmentsToday = await prisma.appointment.count({
      where: {
        companyId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' }
      }
    });

    // 2. Faturamento do Mês
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyAppointments = await prisma.appointment.findMany({
      where: {
        companyId,
        date: { gte: startOfMonth, lte: endOfMonth },
        status: { not: 'CANCELLED' }
      },
      include: { service: true }
    });

    let totalRevenue = 0;
    monthlyAppointments.forEach(app => {
      totalRevenue += Number(app.service.price);
    });

    // 3. Clientes Únicos
    // CORREÇÃO: Usar clientPhone em vez de customerPhone
    const uniqueClientsList = await prisma.appointment.findMany({
      where: { companyId, clientPhone: { not: null } },
      distinct: ['clientPhone'],
      select: { clientPhone: true }
    });
    
    // Soma clientes cadastrados na plataforma
    const registeredClients = await prisma.user.count({
      where: { companyId, role: 'CLIENT' }
    });

    const uniqueClients = uniqueClientsList.length + registeredClients;

    return res.json({
      appointmentsToday,
      totalRevenue,
      uniqueClients
    });

  } catch (error) {
    console.error("Erro dashboard:", error);
    return res.status(500).json({ error: "Erro ao buscar métricas." });
  }
};