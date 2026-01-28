const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  const companyId = req.user.companyId;

  try {
    const now = new Date();
    
    // 1. Agendamentos de Hoje (00:00 até 23:59)
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const appointmentsToday = await prisma.appointment.count({
      where: {
        companyId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' }
      }
    });

    // 2. Faturamento do Mês (Previsão: Pendente + Confirmado + Concluído)
    // Para mostrar o potencial total do mês no card
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

    // 3. Clientes Únicos (Baseado no telefone)
    // O Prisma tem uma função distinct para isso
    const uniqueClientsList = await prisma.appointment.findMany({
      where: { companyId },
      distinct: ['customerPhone'],
      select: { customerPhone: true }
    });
    
    const uniqueClients = uniqueClientsList.length;

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