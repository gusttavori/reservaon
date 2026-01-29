const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCompanies = async (req, res) => {
  const { search } = req.query;

  try {
    const companies = await prisma.company.findMany({
      where: {
        // Se você não tiver certeza se as empresas estão 'active', 
        // comente a linha abaixo para testar:
        active: true, 
        name: {
          contains: search || '',
          mode: 'insensitive'
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

      // CORREÇÃO DE SEGURANÇA: Uso de optional chaining (?.)
      // Evita erro 500 se a empresa não tiver plano
      const planSlug = company.plan?.slug?.toLowerCase() || 'basico';
      const showRating = ['avancado', 'premium'].includes(planSlug);

      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        address: company.address,
        description: company.description,
        // Retorna a média apenas se o plano permitir
        averageRating: showRating ? averageRating : null,
        totalReviews: showRating ? totalReviews : null,
        openingTime: company.openingTime,
        closingTime: company.closingTime,
        category: company.category // Útil para filtros
      };
    });

    res.json(formattedCompanies);
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    // Retorna array vazio em vez de erro se a tabela não existir ainda (opcional)
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
        workSchedule: true, // Importante para o BookingPage
        reviews: true       // Se quiser exibir reviews na página interna
      }
    });

    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar empresa." });
  }
};