const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');

// --- ROTAS DE CONFIGURAÇÃO ---
// GET /api/company/settings -> Busca os dados da empresa
router.get('/settings', authMiddleware, companyController.getSettings);

// PUT /api/company/settings -> Atualiza os dados da empresa
router.put('/settings', authMiddleware, companyController.updateSettings);

// --- ROTAS FINANCEIRAS ---
// GET /api/company/financials -> Busca o financeiro
router.get('/financials', authMiddleware, companyController.getFinancialStats);

// POST /api/company/expenses -> Adiciona despesa
router.post('/expenses', authMiddleware, companyController.addExpense);

// DELETE /api/company/expenses/:id -> Remove despesa
router.delete('/expenses/:id', authMiddleware, companyController.deleteExpense);

module.exports = router;