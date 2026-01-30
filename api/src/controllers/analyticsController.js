const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAdvancedStats = async (req, res) => {
  const companyId = req.user.companyId;
  const { month, year } = req.query;

  try {
    const startDate = month && year 
      ? new Date(year, month - 1, 1) 
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const endDate = month && year 
      ? new Date(year, month, 0, 23, 59, 59) 
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // 1. Buscamos todos os agendamentos concluídos do período
    const appointments = await prisma.appointment.findMany({
      where: {
        companyId,
        status: { in: ['COMPLETED', 'CONFIRMED'] }, // Considera confirmados também para projeção
        date: { gte: startDate, lte: endDate }
      },
      include: {
        service: true,
        professional: true
      }
    });

    // 2. Processamento de Dados (Agregações)
    
    // A) Receita por Serviço
    const servicesMap = {};
    appointments.forEach(app => {
      const name = app.service.name;
      const value = Number(app.service.price);
      if (!servicesMap[name]) servicesMap[name] = 0;
      servicesMap[name] += value;
    });
    
    const revenueByService = Object.keys(servicesMap).map(key => ({
      name: key,
      value: servicesMap[key]
    })).sort((a, b) => b.value - a.value);

    // B) Agendamentos por Profissional
    const teamMap = {};
    appointments.forEach(app => {
      const name = app.professional ? app.professional.name : 'Sem Profissional';
      if (!teamMap[name]) teamMap[name] = 0;
      teamMap[name] += 1;
    });

    const appsByProfessional = Object.keys(teamMap).map(key => ({
      name: key,
      count: teamMap[key]
    })).sort((a, b) => b.count - a.count);

    // C) Faturamento Diário
    const dailyMap = {};
    const daysInMonth = endDate.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      dailyMap[i] = 0;
    }

    appointments.forEach(app => {
      const day = new Date(app.date).getDate();
      dailyMap[day] += Number(app.service.price);
    });

    const dailyRevenue = Object.keys(dailyMap).map(key => ({
      day: `Dia ${key}`,
      value: dailyMap[key]
    }));

    res.json({
      revenueByService,
      appsByProfessional,
      dailyRevenue,
      totalRevenue: revenueByService.reduce((acc, curr) => acc + curr.value, 0),
      totalAppointments: appointments.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar relatórios." });
  }
};