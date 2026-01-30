const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar Agenda
exports.listAppointments = async (req, res) => {
  const companyId = req.user.companyId;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const whereClause = { companyId };

    // Se for funcionário, pode descomentar para ver apenas os dele
    // if (userRole === 'PROFESSIONAL') whereClause.professionalId = userId;

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: true,
        professional: { select: { name: true } },
        user: { select: { name: true, email: true } } // Traz dados do usuário logado se existir
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Formatação robusta para garantir que o nome apareça
    const formatted = appointments.map(appt => ({
      id: appt.id,
      date: appt.date,
      status: appt.status,
      notes: appt.notes,
      
      // Lógica de Nome: Prioriza o nome digitado (público/interno) > nome do usuário cadastrado > fallback
      clientName: appt.clientName || appt.user?.name || "Cliente sem nome",
      
      // Lógica de Contato: Prioriza telefone digitado > email do usuário
      clientPhone: appt.clientPhone || appt.user?.email || "Sem contato",
      
      serviceName: appt.service.name,
      price: appt.service.price,
      professionalName: appt.professional?.name
    }));

    return res.json(formatted);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar agenda." });
  }
};

// ... Mantenha as outras funções (createAppointmentInternal, updateStatus, deleteAppointment) iguais ...
// Se precisar que eu repita o arquivo todo, me avise, mas apenas a 'listAppointments' afeta a visualização.
exports.createAppointmentInternal = async (req, res) => {
  const { date, clientName, clientPhone, serviceId, notes, professionalId } = req.body;
  const companyId = req.user.companyId;

  try {
    const appointmentDate = new Date(date);

    if (!clientName || !serviceId || !date) {
      return res.status(400).json({ error: "Nome, Serviço e Data são obrigatórios." });
    }

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
        clientName,   
        clientPhone,  
        serviceId,
        companyId,
        notes,
        status: "CONFIRMED",
        userId: null, 
        professionalId: professionalId || req.user.userId 
      }
    });

    return res.status(201).json(appointment);

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ error: "Erro ao criar agendamento interno." });
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

exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id, companyId: req.user.companyId }
    });

    if (!appointment) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }

    await prisma.appointment.delete({ where: { id } });
    res.json({ message: "Agendamento cancelado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cancelar agendamento." });
  }
};