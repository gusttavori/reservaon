const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, teamController.getTeam);
router.post('/', authMiddleware, teamController.addMember);
router.put('/:id', authMiddleware, teamController.updateMember); // Rota de Edição
router.delete('/:id', authMiddleware, teamController.removeMember);

module.exports = router;