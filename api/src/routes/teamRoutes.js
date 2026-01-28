const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', teamController.getTeam);
router.post('/', teamController.addMember);
router.delete('/:id', teamController.removeMember);

module.exports = router;