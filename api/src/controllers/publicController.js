const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCompanies = async (req, res) => {
  const { search } = req.query;
  try {
    const companies = await prisma.company.findMany({
      where: {
        active: true,
        name: { contains: search || '', mode: 'insensitive' }
      },
      include: {
        plan: true,
        reviews: { select: { rating: true } }
      }
    });

    const formattedCompanies = companies.map(company => {
      const safeReviews = company.reviews || [];
      const totalReviews = safeReviews.length;
      const sumRatings = safeReviews.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = totalReviews > 0 ? (sumRatings / totalReviews) : 0;
      const planSlug = company.plan?.slug?.toLowerCase() || 'basico';
      const showRating = ['avancado', 'premium'].includes(planSlug);

      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        address: company.address,
        description: company.description,
        averageRating: showRating ? averageRating : null,
        totalReviews: showRating ? totalReviews : null,
        openingTime: company.openingTime,
        closingTime: company.closingTime,
        category: company.category
      };
    });
    res.json(formattedCompanies);
  } catch (error) {
    console.error("Erro catálogo:", error);
    res.json([]);
  }
};

exports.getCompanyBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const company = await prisma.company.findUnique({
      where: { slug },
      include: { 
        services: true, 
        plan: true, 
        reviews: true,
        // ALTERADO: Inclui usuários para escolha do profissional (apenas campos seguros)
        users: {
          select: { id: true, name: true, role: true }
        }
      }
    });
    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });
    res.json(company);
  } catch (error) {
    console.error("Erro slug:", error);
    res.status(500).json({ error: "Erro ao carregar empresa." });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    console.log("Recebendo agendamento:", req.body);

    // ALTERADO: Recebe professionalId
    const { companyId, serviceId, date, clientName, clientPhone, notes, professionalId } = req.body;

    if (!companyId || !serviceId || !date || !clientName || !clientPhone) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const appointment = await prisma.appointment.create({
      data: {
        companyId,
        serviceId,
        date: new Date(date),
        clientName,
        clientPhone,
        notes: notes || "Agendamento via Site",
        status: 'PENDING',
        userId: null,
        // ALTERADO: Salva o ID do profissional escolhido (ou null)
        professionalId: professionalId || null
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("ERRO CRÍTICO NO AGENDAMENTO:", error);
    res.status(500).json({ error: "Erro interno ao salvar. O banco recusou os dados." });
  }
};