const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLogs = async (req, res) => {
  const companyId = req.user.companyId;

  try {
    // Verificar Plano (Feature Premium)
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true }
    });

    if (company.plan.slug !== 'premium') {
      return res.status(403).json({ error: "Funcionalidade exclusiva do plano Premium." });
    }

    const logs = await prisma.activityLog.findMany({
      where: { companyId },
      include: { user: { select: { name: true } } }, // Inclui nome de quem fez
      orderBy: { createdAt: 'desc' },
      take: 50 // Limita aos últimos 50 eventos
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar logs." });
  }
};