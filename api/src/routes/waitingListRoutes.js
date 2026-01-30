const express = require('express');
const router = express.Router();
const waitingListController = require('../controllers/waitingListController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota Pública (Sem Auth)
router.post('/public', waitingListController.joinWaitingList);

// Rotas Privadas (Com Auth)
router.get('/', authMiddleware, waitingListController.getWaitingList);
router.delete('/:id', authMiddleware, waitingListController.removeFromList);

module.exports = router;