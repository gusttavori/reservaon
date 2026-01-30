const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar Agenda
exports.listAppointments = async (req, res) => {
  const companyId = req.user.companyId;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const whereClause = { companyId };

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: true,
        professional: { select: { name: true } },
        user: { select: { name: true } } // Cliente logado (se houver)
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Formatação para garantir que o frontend receba o nome correto
    const formatted = appointments.map(appt => ({
      ...appt,
      // CORREÇÃO: Prioriza clientName (agendamento manual/publico) sobre user.name
      title: appt.clientName || appt.user?.name || "Cliente sem nome",
      clientName: appt.clientName || appt.user?.name // Reforço
    }));

    return res.json(formatted);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar agenda." });
  }
};

// Criar Agendamento Interno
exports.createAppointmentInternal = async (req, res) => {
  // CORREÇÃO: Recebe clientName e clientPhone
  const { date, clientName, clientPhone, serviceId, notes, professionalId } = req.body;
  const companyId = req.user.companyId;

  try {
    const appointmentDate = new Date(date);

    // Validação básica
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
        clientName,   // Salva nome manual
        clientPhone,  // Salva telefone manual
        serviceId,
        companyId,
        notes,
        status: "CONFIRMED",
        userId: null, // Interno não tem vínculo obrigatório com conta
        professionalId: professionalId || req.user.userId // Se não selecionou, quem criou é o responsável
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

// --- A FUNÇÃO QUE FALTAVA ---
exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    // Verifica se pertence à empresa antes de deletar
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