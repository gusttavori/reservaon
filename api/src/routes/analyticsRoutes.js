const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define a rota raiz '/' para que '/api/analytics' chame a função correta
router.get('/', authMiddleware, analyticsController.getAdvancedStats);

module.exports = router;