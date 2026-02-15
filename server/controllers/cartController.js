const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { success } = require('../utils/responseFormatter');

exports.getCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('restaurantId');

    if (!cart) {
        return success(res, { cart: null });
    }

    success(res, { cart });
});

exports.addToCart = catchAsync(async (req, res, next) => {
    const { menuItemId, quantity = 1, restaurantId } = req.body;

    // 1) Find the menu item
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
        return next(new AppError('No menu item found with that ID', 404));
    }

    // 2) Find or create the user's cart
    let cart = await Cart.findOne({ userId: req.user._id });

    if (cart) {
        // Check if adding from a different restaurant
        if (cart.restaurantId.toString() !== restaurantId) {
            // Business Rule: Confirm with user usually, but here we'll follow Swiggy pattern:
            // Clear existing cart and start new one if it's a different restaurant
            cart.restaurantId = restaurantId;
            cart.items = [];
        }

        // 3) Check if item already exists in cart
        const itemIndex = cart.items.findIndex(item => item.menuItemId.toString() === menuItemId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].subtotal = cart.items[itemIndex].quantity * menuItem.price;
        } else {
            cart.items.push({
                menuItemId,
                name: menuItem.name,
                price: menuItem.price,
                quantity,
                subtotal: menuItem.price * quantity
            });
        }
    } else {
        // Create new cart
        cart = new Cart({
            userId: req.user._id,
            restaurantId,
            items: [{
                menuItemId,
                name: menuItem.name,
                price: menuItem.price,
                quantity,
                subtotal: menuItem.price * quantity
            }]
        });
    }

    await cart.save();
    success(res, { cart });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
    const { menuItemId, quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    const itemIndex = cart.items.findIndex(item => item.menuItemId.toString() === menuItemId);
    if (itemIndex === -1) {
        return next(new AppError('Item not found in cart', 404));
    }

    if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
    } else {
        cart.items[itemIndex].quantity = quantity;
    }

    // If cart becomes empty, remove restaurantId or delete cart? 
    // Usually keep the cart but items empty.

    await cart.save();
    success(res, { cart });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
    const { menuItemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter(item => item.menuItemId.toString() !== menuItemId);

    await cart.save();
    success(res, { cart });
});

exports.clearCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
        cart.items = [];
        cart.restaurantId = null; // Or keep it if we want to stay within the same shop
        // Actually, deleting or clearing everything is cleaner
        await cart.deleteOne();
    }

    success(res, { message: 'Cart cleared successfully' }, 204);
});
