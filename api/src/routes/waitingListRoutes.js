const express = require('express');
const router = express.Router();
const waitingListController = require('../controllers/waitingListController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/public', waitingListController.addToWaitingList);

router.use(authMiddleware);
router.get('/', waitingListController.getWaitingList);
router.put('/:id', waitingListController.updateStatus);

module.exports = router;