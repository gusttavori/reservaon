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
          mode: 'insensitive'
        }
      },
      include: {
        plan: true,
        // Tenta incluir reviews se a relação existir
        reviews: {
          select: { rating: true }
        }
      }
    });

    const formattedCompanies = companies.map(company => {
      // Blindagem: Se reviews for undefined, trata como array vazio
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
    console.error("Erro ao buscar catálogo:", error);
    // Retorna array vazio em caso de erro crítico para não travar o frontend
    res.json([]); 
  }
};

exports.getCompanyBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    // Busca a empresa
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        services: true,
        plan: true,
        reviews: true 
        // OBS: Removido 'workSchedule: true' pois é um campo JSON, não uma relação.
        // Ele virá automaticamente junto com os dados da company.
      }
    });

    if (!company) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    res.json(company);
  } catch (error) {
    console.error("Erro ao buscar empresa (Slug):", error);
    
    // TENTATIVA DE RECUPERAÇÃO (FALLBACK)
    // Se o erro for por causa do 'include: reviews' (caso a tabela não exista),
    // tentamos buscar de novo sem incluir as reviews.
    try {
      const companySimple = await prisma.company.findUnique({
        where: { slug },
        include: {
          services: true,
          plan: true
        }
      });
      if (companySimple) return res.json(companySimple);
    } catch (retryError) {
      console.error("Falha total ao buscar empresa:", retryError);
    }

    res.status(500).json({ error: "Erro interno ao carregar página da empresa." });
  }
};

// POST: Criar Agendamento Público
exports.createAppointment = async (req, res) => {
  try {
    const { companyId, serviceId, date, clientName, clientPhone, notes } = req.body;

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
        notes,
        status: 'PENDING' 
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Erro ao agendar:", error);
    res.status(500).json({ error: "Erro ao criar agendamento." });
  }
};