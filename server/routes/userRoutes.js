const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Allow authenticated users to update their FCM token
router.post('/update-fcm-token', protect, userController.updateFCMToken);

module.exports = router;
