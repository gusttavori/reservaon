exports.createProfessional = async (req, res) => {
  const companyId = req.user.companyId;

  // 1. Busca dados da empresa e plano
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { 
      plan: true,
      users: true // Traz os usuários existentes para contar
    }
  });

  // 2. Define limites baseados no plano (Pode vir do JSON do plano no banco)
  const limits = {
    'basico': 1,
    'profissional': 3,
    'avancado': 5,
    'premium': 999
  };

  const maxProfessionals = limits[company.plan.slug];
  const currentProfessionals = company.users.length; // Conta quantos já tem

  // 3. BLOQUEIA SE EXCEDER
  if (currentProfessionals >= maxProfessionals) {
    return res.status(403).json({ 
      error: `Seu plano permite apenas ${maxProfessionals} profissionais. Faça upgrade!` 
    });
  }

  // ... prossegue com a criação ...
};