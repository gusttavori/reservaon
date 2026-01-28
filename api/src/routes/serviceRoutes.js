const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', serviceController.getServices);
router.post('/', serviceController.createService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;