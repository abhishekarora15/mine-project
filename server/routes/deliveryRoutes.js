const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect, requireDelivery } = require('../middleware/authMiddleware');

router.use(protect);
router.use(requireDelivery);

router.get('/orders', deliveryController.getAssignedOrders);
router.patch('/orders/:id/status', deliveryController.updateOrderStatus);
router.patch('/location', deliveryController.updateLocation);
router.patch('/availability', deliveryController.toggleAvailability);
router.get('/dashboard', deliveryController.getDashboard);

module.exports = router;
