const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getActivityLogs = async (req, res) => {
  const companyId = req.user.companyId;

  try {
    // Verificar Plano (Feature Premium)
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true }
    });

    // Opcional: Se quiser liberar para todos por enquanto, comente o if abaixo
    if (company.plan.slug !== 'premium' && company.plan.slug !== 'avancado') {
       return res.status(403).json({ error: "Funcionalidade exclusiva do plano Premium." });
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