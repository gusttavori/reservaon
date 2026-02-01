const express = require('express');
const router = express.Router();
const appointmentController = require('./controllers/appointmentController');
const companyController = require('./controllers/companyController');
const authMiddleware = require('./middlewares/authMiddleware');

// --- AGENDAMENTOS ---
router.get('/appointments', authMiddleware, appointmentController.listAppointments);
router.post('/appointments', authMiddleware, appointmentController.createAppointmentInternal);
router.put('/appointments/:id/status', authMiddleware, appointmentController.updateStatus);
router.delete('/appointments/:id', authMiddleware, appointmentController.deleteAppointment);

// --- CONFIGURAÇÕES DA EMPRESA (Inclui busca de usuários) ---
router.get('/settings', authMiddleware, companyController.getSettings);
router.put('/settings', authMiddleware, companyController.updateSettings);

// --- FINANCEIRO ---
router.get('/financials', authMiddleware, companyController.getFinancialStats);
router.post('/expenses', authMiddleware, companyController.addExpense);
router.delete('/expenses/:id', authMiddleware, companyController.deleteExpense);

module.exports = router;