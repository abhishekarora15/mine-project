const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/restaurant/:restaurantId', restrictTo('RESTAURANT_OWNER', 'ADMIN'), orderController.getRestaurantOrders);
router.patch('/:id/status', restrictTo('RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN'), orderController.updateOrderStatus);

module.exports = router;
