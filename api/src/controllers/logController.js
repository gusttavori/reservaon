const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getActivityLogs = async (req, res) => {
  const companyId = req.user.companyId;

  try {
    // Verificar Plano
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true }
    });

    // Libera apenas para Avançado e Premium
    const allowedPlans = ['avancado', 'premium'];
    if (!allowedPlans.includes(company.plan.slug.toLowerCase())) {
       return res.status(403).json({ error: "Funcionalidade exclusiva dos planos Avançado e Premium." });
    }

    const logs = await prisma.activityLog.findMany({
      where: { companyId },
      include: { user: { select: { name: true } } }, // Inclui nome de quem fez a ação
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar logs." });
  }
};