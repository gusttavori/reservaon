const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');
const prisma = new PrismaClient();

// 1. Listar Empresas (Catálogo)
exports.getCompanies = async (req, res) => {
  const { search } = req.query;
  try {
    const companies = await prisma.company.findMany({
      where: {
        active: true,
        // Exibe apenas empresas com plano Ativo ou Trial
        subscriptionStatus: { in: ['ACTIVE', 'TRIAL'] },
        name: { contains: search || '', mode: 'insensitive' }
      },
      include: {
        plan: true,
        reviews: { select: { rating: true } }
      }
    });

    const formatted = companies.map(c => {
      // Calcula média de avaliações
      const safeReviews = c.reviews || [];
      const totalReviews = safeReviews.length;
      const sumRatings = safeReviews.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = totalReviews > 0 ? (sumRatings / totalReviews) : 0;
      
      const planSlug = c.plan?.slug?.toLowerCase() || 'basico';
      const showRating = ['avancado', 'premium'].includes(planSlug);

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        logoUrl: c.logoUrl,
        address: c.address,
        description: c.description,
        category: c.category,
        openingTime: c.openingTime,
        closingTime: c.closingTime,
        averageRating: showRating ? averageRating : null,
        totalReviews: showRating ? totalReviews : null
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Erro catálogo:", error);
    res.json([]);
  }
};

// 2. Buscar Empresa por Slug (Perfil Público)
exports.getCompanyBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const company = await prisma.company.findUnique({
      where: { slug },
      include: { 
        services: true, 
        plan: true, 
        reviews: true,
        // Inclui usuários para seleção de profissional (apenas dados seguros)
        users: { select: { id: true, name: true, role: true } }
      }
    });

    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    // Verifica se a empresa pode receber agendamentos (ACTIVE ou TRIAL)
    if (company.subscriptionStatus !== 'ACTIVE' && company.subscriptionStatus !== 'TRIAL') {
      return res.status(403).json({ error: "Esta empresa está temporariamente indisponível." });
    }

    res.json(company);
  } catch (error) {
    console.error("Erro slug:", error);
    res.status(500).json({ error: "Erro ao carregar empresa." });
  }
};

// 3. Criar Agendamento Público
exports.createAppointmentPublic = async (req, res) => {
  const { date, clientName, clientPhone, serviceId, companyId, professionalId, notes } = req.body;

  try {
    // Validação da Empresa e Assinatura
    const company = await prisma.company.findUnique({ 
      where: { id: companyId },
      include: { plan: true, users: true }
    });

    if (!company) return res.status(404).json({ error: "Empresa não encontrada." });

    if (company.subscriptionStatus !== 'ACTIVE' && company.subscriptionStatus !== 'TRIAL') {
      return res.status(403).json({ error: "Empresa indisponível para agendamentos." });
    }

    if (company.plan.slug === 'basico') {
      return res.status(403).json({ error: "Plano Básico não aceita agendamento online." });
    }

    // Validação de Data e Horário
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

    // Validação simples de horário (confiando no frontend, mas garantindo no back)
    if (appointmentHour < openHour || appointmentHour >= closeHour) {
      return res.status(400).json({ error: `Fechado. Atendemos das ${openTime} às ${closeTime}.` });
    }

    const dayOfWeek = appointmentDate.getDay();
    const allowedDays = workingDaysStr.split(',').map(Number);
    
    if (!allowedDays.includes(dayOfWeek)) {
      return res.status(400).json({ error: "Não atendemos neste dia." });
    }

    // Verificar Disponibilidade
    const checkAvailability = await prisma.appointment.findFirst({
      where: {
        companyId,
        date: appointmentDate,
        status: { not: 'CANCELLED' },
        // Se profissional foi escolhido, verifica conflito apenas dele
        ...(professionalId ? { professionalId } : {})
      }
    });

    if (checkAvailability) return res.status(400).json({ error: "Este horário já está reservado." });

    // Criar Agendamento
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        clientName,   // Nome manual
        clientPhone,  // Telefone manual
        serviceId,
        companyId,
        status: "PENDING",
        notes: notes || "Agendamento via Site",
        userId: null, // Sem login obrigatório
        professionalId: professionalId || null
      },
      include: { 
        service: true 
      }
    });

    // Notificar Dono (se houver serviço de email)
    const owner = company.users.find(u => u.role === 'OWNER');
    if (owner && emailService) {
      emailService.sendBookingNotification(
        owner.email, 
        appointment.clientName, 
        appointment.service.name, 
        appointment.date
      ).catch(err => console.error("Erro ao enviar email:", err));
    }

    return res.status(201).json(appointment);

  } catch (error) {
    console.error("Erro no agendamento público:", error);
    return res.status(500).json({ error: "Erro interno ao processar agendamento." });
  }
};