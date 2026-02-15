const express = require('express');
const adminController = require('../controllers/adminController');
const menuManagerController = require('../controllers/menuManagerController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are protected and restricted to Restaurant Owners or Admins
router.use(protect);
router.use(restrictTo('RESTAURANT_OWNER', 'ADMIN'));

// Dashboard Stats
router.get('/dashboard', adminController.getDashboardStats);

// Order Management
router.get('/orders', adminController.getRestaurantOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Menu Management
router.route('/menu')
    .post(menuManagerController.createMenuItem);

router.get('/menu/restaurant/:restaurantId', menuManagerController.getRestaurantMenu);

router.route('/menu/:id')
    .patch(menuManagerController.updateMenuItem)
    .delete(menuManagerController.deleteMenuItem);

module.exports = router;
