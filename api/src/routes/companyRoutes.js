const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/settings', companyController.getSettings);
router.put('/settings', companyController.updateSettings);

router.get('/financials', companyController.getFinancialStats);
router.post('/expenses', companyController.addExpense);
router.delete('/expenses/:id', companyController.deleteExpense);

module.exports = router;