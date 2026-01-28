const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const PLAN_LIMITS = {
  'basico': 1,
  'profissional': 3,
  'avancado': 5,
  'premium': 10
};

exports.getTeam = async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const team = await prisma.user.findMany({
      where: { companyId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        canViewFinancials: true, // <--- Retorna permissão
        createdAt: true 
      }
    });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar equipe." });
  }
};

exports.addMember = async (req, res) => {
  const { name, email, password, canViewFinancials } = req.body;
  const companyId = req.user.companyId;

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true }
    });

    if (!company) return res.status(404).json({ error: "Empresa não encontrada." });

    const currentCount = await prisma.user.count({ where: { companyId } });
    const planSlug = company.plan.slug.toLowerCase();
    const limit = PLAN_LIMITS[planSlug] || 1;

    if (currentCount >= limit) {
      return res.status(403).json({ 
        error: `O plano ${company.plan.name} permite no máximo ${limit} usuários.` 
      });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "E-mail já cadastrado." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER', // Usando USER em vez de PROFESSIONAL para padronizar
        companyId,
        canViewFinancials: canViewFinancials || false
      }
    });

    res.status(201).json(newUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar membro." });
  }
};

exports.removeMember = async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.companyId;

  try {
    if (id === req.user.userId) {
      return res.status(400).json({ error: "Você não pode se excluir." });
    }

    const user = await prisma.user.findFirst({ where: { id, companyId } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    await prisma.user.delete({ where: { id } });
    res.json({ message: "Membro removido." });

  } catch (error) {
    res.status(500).json({ error: "Erro ao remover membro." });
  }
};