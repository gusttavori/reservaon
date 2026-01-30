const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, logController.getActivityLogs);

module.exports = router;