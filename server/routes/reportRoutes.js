const express = require('express');

const requireAuth = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');
const { uploadReportFile } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(requireAuth);

router.post('/upload', uploadReportFile.single('reportFile'), reportController.uploadReport);
router.get('/', reportController.getReports);
router.get('/count', reportController.getReportCount);
router.get('/:id', reportController.getReportById);
router.delete('/:id', reportController.deleteReport);

module.exports = router;