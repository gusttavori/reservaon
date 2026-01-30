const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Garante que a função existe antes de passar para a rota
router.get('/advanced', authMiddleware, analyticsController.getAdvancedStats);

module.exports = router;