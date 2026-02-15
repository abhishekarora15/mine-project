const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(cartController.getCart)
    .post(cartController.addToCart)
    .delete(cartController.clearCart);

router.patch('/update', cartController.updateCartItem);
router.delete('/remove/:menuItemId', cartController.removeFromCart);

module.exports = router;
