const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Público: Cliente envia avaliação
exports.createReview = async (req, res) => {
  const { companyId, rating, comment, customerName } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Nota deve ser entre 1 e 5." });
  }

  try {
    const review = await prisma.review.create({
      data: {
        companyId,
        rating: parseInt(rating),
        comment,
        customerName: customerName || 'Anônimo'
      }
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar avaliação." });
  }
};

// Privado: Dono vê todas as avaliações
exports.getReviews = async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const reviews = await prisma.review.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Calcula média simples
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = reviews.length > 0 ? (total / reviews.length).toFixed(1) : 0;

    res.json({ reviews, average, total: reviews.length });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar avaliações." });
  }
};

// Público: Página de Agendamento busca média e últimos comentários
exports.getPublicReviews = async (req, res) => {
  const { slug } = req.params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    const reviews = await prisma.review.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
      take: 5 // Retorna apenas as 5 últimas para não pesar
    });

    // Agregação para média geral
    const aggregations = await prisma.review.aggregate({
      where: { companyId: company.id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    res.json({
      reviews,
      average: aggregations._avg.rating || 0,
      total: aggregations._count.rating || 0
    });

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dados públicos." });
  }
};