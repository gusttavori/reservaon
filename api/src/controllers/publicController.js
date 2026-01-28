const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCompanies = async (req, res) => {
  const { search } = req.query;

  try {
    const companies = await prisma.company.findMany({
      where: {
        active: true,
        name: {
          contains: search || '',
          mode: 'insensitive' // Busca sem diferenciar maiúsculas/minúsculas
        }
      },
      include: {
        plan: true,
        reviews: {
          select: { rating: true }
        }
      }
    });

    const formattedCompanies = companies.map(company => {
      const totalReviews = company.reviews.length;
      const sumRatings = company.reviews.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = totalReviews > 0 ? (sumRatings / totalReviews) : 0;

      // Verifica se o plano permite exibir avaliações (Avançado ou Premium)
      const showRating = company.plan && ['avancado', 'premium'].includes(company.plan.slug.toLowerCase());

      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        address: company.address,
        description: company.description,
        averageRating: showRating ? averageRating : null,
        totalReviews: showRating ? totalReviews : null,
        // Campos auxiliares para o card
        openingTime: company.openingTime,
        closingTime: company.closingTime
      };
    });

    res.json(formattedCompanies);
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    res.status(500).json({ error: "Erro ao buscar empresas." });
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
        // Incluir workSchedule e outros dados necessários
      }
    });

    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    // Pode remover dados sensíveis aqui se necessário, mas para agendamento precisamos da maioria
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar empresa." });
  }
};