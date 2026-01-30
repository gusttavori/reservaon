const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');
const prisma = new PrismaClient();

exports.createAppointmentPublic = async (req, res) => {
  // CORREÇÃO: Ajustado para clientName/clientPhone conforme novo schema
  const { date, clientName, clientPhone, serviceId, companyId, professionalId } = req.body;

  try {
    const company = await prisma.company.findUnique({ 
      where: { id: companyId },
      include: { plan: true, users: true }
    });

    if (!company) return res.status(404).json({ error: "Empresa não encontrada." });

    // CORREÇÃO: Bloqueio se a assinatura não estiver Ativa ou em Teste
    if (company.subscriptionStatus !== 'ACTIVE' && company.subscriptionStatus !== 'TRIAL') {
      return res.status(403).json({ 
        error: "Esta empresa não está recebendo agendamentos no momento." 
      });
    }

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

    // Validação simples de horário (O ideal é confiar na UI, mas validamos o básico)
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
        status: { not: 'CANCELLED' },
        // Se houver profissional, verifica conflito apenas para ele
        ...(professionalId ? { professionalId } : {})
      }
    });

    if (checkAvailability) return res.status(400).json({ error: "Este horário já está reservado." });

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        clientName,  // Campo correto
        clientPhone, // Campo correto
        serviceId,
        companyId,
        status: "PENDING",
        userId: null,
        professionalId: professionalId || null
      },
      include: { 
        service: true 
      }
    });

    const owner = company.users.find(u => u.role === 'OWNER');
    
    if (owner) {
      // Envia notificação (assíncrono para não travar)
      emailService.sendBookingNotification(
        owner.email, 
        appointment.clientName, 
        appointment.service.name, 
        appointment.date
      ).catch(console.error);
    }

    return res.status(201).json(appointment);

  } catch (error) {
    console.error("Erro no agendamento público:", error);
    return res.status(500).json({ error: "Erro interno ao processar agendamento." });
  }
};