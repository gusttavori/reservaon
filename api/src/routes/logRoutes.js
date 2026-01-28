const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);
router.get('/', logController.getLogs);

module.exports = router;