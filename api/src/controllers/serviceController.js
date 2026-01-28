const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logAction } = require('../utils/logger');

exports.getServices = async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const services = await prisma.service.findMany({
      where: { companyId }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar serviços." });
  }
};

exports.createService = async (req, res) => {
  const { name, price, duration, bufferTime } = req.body;
  const companyId = req.user.companyId;
  const userId = req.user.userId;

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true }
    });

    let finalBuffer = 0;
    const planSlug = company.plan.slug.toLowerCase();

    if (bufferTime > 0) {
      if (planSlug === 'avancado' || planSlug === 'premium') {
        finalBuffer = parseInt(bufferTime);
      }
    }

    const service = await prisma.service.create({
      data: {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        bufferTime: finalBuffer,
        companyId
      }
    });

    await logAction(companyId, userId, 'CREATE_SERVICE', `Criou o serviço: ${name} (R$ ${price})`);

    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar serviço." });
  }
};

exports.deleteService = async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.companyId;
  const userId = req.user.userId;

  try {
    const service = await prisma.service.findFirst({ where: { id, companyId } });
    
    if (!service) {
      return res.status(404).json({ error: "Serviço não encontrado." });
    }

    await prisma.service.delete({ where: { id } });

    await logAction(companyId, userId, 'DELETE_SERVICE', `Excluiu o serviço: ${service.name}`);

    res.json({ message: "Serviço deletado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar serviço." });
  }
};