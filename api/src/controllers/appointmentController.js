const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');
const prisma = new PrismaClient();

exports.createAppointmentPublic = async (req, res) => {
  const { date, customerName, customerPhone, serviceId, companyId } = req.body;

  try {
    const company = await prisma.company.findUnique({ 
      where: { id: companyId },
      include: { plan: true, users: true }
    });

    if (!company) return res.status(404).json({ error: "Empresa não encontrada." });

    if (company.plan.slug === 'basico') {
      return res.status(403).json({ 
        error: "Esta empresa não aceita agendamentos online. Entre em contato diretamente." 
      });
    }

    const appointmentDate = new Date(date);
    const now = new Date();

    if (appointmentDate < now) {
      return res.status(400).json({ error: "Não é possível agendar no passado." });
    }

    const openTime = company.openingTime || "09:00";
    const closeTime = company.closingTime || "18:00";
    const workingDaysStr = company.workDays || "1,2,3,4,5";

    const openHour = parseInt(openTime.split(':')[0]);
    const closeHour = parseInt(closeTime.split(':')[0]);
    const appointmentHour = appointmentDate.getHours();

    if (appointmentHour < openHour || appointmentHour >= closeHour) {
      return res.status(400).json({ error: `Fechado. Atendemos das ${openTime} às ${closeTime}.` });
    }

    const dayOfWeek = appointmentDate.getDay();
    const allowedDays = workingDaysStr.split(',').map(Number);
    
    if (!allowedDays.includes(dayOfWeek)) {
      return res.status(400).json({ error: "Não atendemos neste dia." });
    }

    const checkAvailability = await prisma.appointment.findFirst({
      where: {
        companyId,
        date: appointmentDate,
        status: { not: 'CANCELLED' }
      }
    });

    if (checkAvailability) return res.status(400).json({ error: "Este horário já está reservado." });

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        customerName,
        customerPhone,
        serviceId,
        companyId,
        status: "PENDING"
      },
      include: { 
        service: true 
      }
    });

    const owner = company.users.find(u => u.role === 'OWNER');
    
    if (owner) {
      emailService.sendBookingNotification(
        owner.email, 
        appointment.customerName, 
        appointment.service.name, 
        appointment.date
      );
    }

    return res.status(201).json(appointment);

  } catch (error) {
    console.error("Erro no agendamento público:", error);
    return res.status(500).json({ error: "Erro interno ao processar agendamento." });
  }
};

exports.createAppointmentInternal = async (req, res) => {
  const { date, customerName, customerPhone, serviceId } = req.body;
  const companyId = req.user.companyId;

  try {
    const appointmentDate = new Date(date);

    const checkAvailability = await prisma.appointment.findFirst({
      where: {
        companyId,
        date: appointmentDate,
        status: { not: 'CANCELLED' }
      }
    });

    if (checkAvailability) {
      return res.status(400).json({ error: "Já existe um agendamento neste horário." });
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        customerName,
        customerPhone,
        serviceId,
        companyId,
        status: "CONFIRMED"
      }
    });

    return res.status(201).json(appointment);

  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar agendamento interno." });
  }
};

exports.listAppointments = async (req, res) => {
  const companyId = req.user.companyId;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const whereClause = { companyId };

    // REGRA DE VISIBILIDADE: Se for funcionário, vê apenas a sua ou sem profissional
    if (userRole === 'USER' || userRole === 'PROFESSIONAL') {
      whereClause.OR = [
        { professionalId: userId },
        { professionalId: null }
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: true,
        professional: { select: { name: true } }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return res.json(appointments);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar agenda." });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const companyId = req.user.companyId;

  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id: id, companyId: companyId }
    });

    if (!appointment) return res.status(404).json({ error: "Agendamento não encontrado." });

    const updated = await prisma.appointment.update({
      where: { id: id },
      data: { status }
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar status." });
  }
};