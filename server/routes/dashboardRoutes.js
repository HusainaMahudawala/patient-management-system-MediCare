const express = require('express');

const requireAuth = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.use(requireAuth);

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;