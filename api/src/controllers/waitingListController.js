const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ROTA PÚBLICA
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
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: "Erro ao entrar na lista de espera." });
  }
};

// ROTA PRIVADA
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

// ROTA PRIVADA: Remover/Atualizar
exports.removeFromList = async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.companyId;

  try {
    // Verifica se pertence à empresa
    const entry = await prisma.waitingList.findFirst({ where: { id, companyId } });
    if (!entry) return res.status(404).json({ error: "Item não encontrado." });

    await prisma.waitingList.delete({ where: { id } });
    res.json({ message: "Removido da lista." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover." });
  }
};