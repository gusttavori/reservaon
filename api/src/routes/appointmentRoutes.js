const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Listar Agenda
router.get('/', authMiddleware, appointmentController.listAppointments);

// Criar Agendamento Interno (Dashboard)
router.post('/', authMiddleware, appointmentController.createAppointmentInternal);

// Atualizar Status (Arrastar no calendário / Botões)
router.put('/:id/status', authMiddleware, appointmentController.updateStatus);

// Deletar
router.delete('/:id', authMiddleware, appointmentController.deleteAppointment);

module.exports = router;