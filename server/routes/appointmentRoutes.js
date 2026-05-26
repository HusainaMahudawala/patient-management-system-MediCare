const express = require('express');

const requireAuth = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

router.use(requireAuth);

router.post('/book', appointmentController.bookAppointment);
router.get('/upcoming', appointmentController.getUpcomingAppointments);
router.get('/count', appointmentController.getAppointmentCount);
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;