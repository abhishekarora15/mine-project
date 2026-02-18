const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/webhook', paymentController.handleWebhook); // Public

router.use(protect);
router.post('/create-order', paymentController.createCashfreeOrder);
router.get('/verify/:orderId', paymentController.verifyPayment);


module.exports = router;
