const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/public', appointmentController.createAppointmentPublic);

router.post('/internal', authMiddleware, appointmentController.createAppointmentInternal);

router.get('/', authMiddleware, appointmentController.listAppointments);
router.put('/:id/status', authMiddleware, appointmentController.updateStatus);

module.exports = router;