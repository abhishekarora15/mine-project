const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const menuController = require('../controllers/menuController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurant);
router.get('/:restaurantId/menu', menuController.getRestaurantMenu);

// Protected routes (Owner/Admin)
router.use(protect);

router.post('/', restrictTo('RESTAURANT_OWNER', 'ADMIN'), restaurantController.createRestaurant);
router.patch('/:id', restrictTo('RESTAURANT_OWNER', 'ADMIN'), restaurantController.updateRestaurant);

// Menu item routes
router.post('/menu-item', restrictTo('RESTAURANT_OWNER', 'ADMIN'), menuController.createMenuItem);
router.patch('/menu-item/:id', restrictTo('RESTAURANT_OWNER', 'ADMIN'), menuController.updateMenuItem);
router.delete('/menu-item/:id', restrictTo('RESTAURANT_OWNER', 'ADMIN'), menuController.deleteMenuItem);

module.exports = router;
