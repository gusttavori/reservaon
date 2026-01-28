const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protege todas as rotas abaixo com autenticação
router.use(authMiddleware);

// Configurações
// Alterado de '/settings' para '/me' para compatibilidade com o SettingsManager existente
router.get('/me', companyController.getSettings);
router.put('/me', companyController.updateSettings);

// Financeiro
router.get('/financials', companyController.getFinancialStats);
router.post('/expenses', companyController.addExpense);
router.delete('/expenses/:id', companyController.deleteExpense);

module.exports = router;