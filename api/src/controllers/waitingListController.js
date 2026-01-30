const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ROTA PÚBLICA: Entrar na lista
exports.joinWaitingList = async (req, res) => {
  const { companyId, customerName, phone, serviceName, notes } = req.body;
  try {
    const entry = await prisma.waitingList.create({
      data: {
        companyId,
        customerName,
        phone,
        serviceName,
        notes,
        status: 'WAITING'
      }
    });
    res.status(201).json({ message: "Adicionado à lista." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao entrar na lista." });
  }
};

// ROTA PRIVADA: Listar no Dashboard
exports.getWaitingList = async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const list = await prisma.waitingList.findMany({
      where: { 
        companyId,
        status: { not: 'CANCELLED' } 
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar lista." });
  }
};

// ROTA PRIVADA: Remover da lista
exports.removeFromList = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.waitingList.delete({ where: { id } });
    res.json({ message: "Removido da lista." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover." });
  }
};