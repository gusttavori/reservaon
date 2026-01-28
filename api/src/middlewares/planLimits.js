const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.checkProfessionalLimit = async (req, res, next) => {
  const companyId = req.user.companyId;

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { 
        plan: true,
        users: true 
      }
    });

    const limits = {
      'basico': 1,
      'profissional': 3,
      'avancado': 5,
      'premium': 999 
    };

    const maxProfessionals = limits[company.plan.slug] || 1;
    const currentCount = company.users.length;

    if (currentCount >= maxProfessionals) {
      return res.status(403).json({ 
        error: `Seu plano ${company.plan.name} permite apenas ${maxProfessionals} profissionais. Faça um upgrade para adicionar mais!` 
      });
    }

    next();

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao verificar limites do plano." });
  }
};