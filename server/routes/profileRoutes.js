const express = require('express');

const requireAuth = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');
const { uploadProfileImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', profileController.getProfile);
router.put('/update', uploadProfileImage.single('profileImage'), profileController.updateProfile);

module.exports = router;