const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addToWaitingList = async (req, res) => {
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

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const companyId = req.user.companyId;

  try {
    const entry = await prisma.waitingList.findFirst({ where: { id, companyId } });
    if (!entry) return res.status(404).json({ error: "Item não encontrado." });

    const updated = await prisma.waitingList.update({
      where: { id },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar status." });
  }
};