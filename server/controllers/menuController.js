const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { success } = require('../utils/responseFormatter');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createMenuItem = catchAsync(async (req, res, next) => {
    // Check if the restaurant belongs to the user
    const restaurant = await Restaurant.findOne({ _id: req.body.restaurantId, ownerId: req.user._id });
    if (!restaurant) {
        return next(new AppError('You can only add items to your own restaurant', 403));
    }

    const newItem = await MenuItem.create(req.body);
    success(res, { menuItem: newItem }, 201);
});

exports.getRestaurantMenu = catchAsync(async (req, res, next) => {
    const menuItems = await MenuItem.find({ restaurantId: req.params.restaurantId });
    success(res, { menuItems });
});

exports.updateMenuItem = catchAsync(async (req, res, next) => {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
        return next(new AppError('No menu item found', 404));
    }

    const restaurant = await Restaurant.findOne({ _id: menuItem.restaurantId, ownerId: req.user._id });
    if (!restaurant) {
        return next(new AppError('You can only update items in your own restaurant', 403));
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    success(res, { menuItem: updatedItem });
});

exports.deleteMenuItem = catchAsync(async (req, res, next) => {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
        return next(new AppError('No menu item found', 404));
    }

    const restaurant = await Restaurant.findOne({ _id: menuItem.restaurantId, ownerId: req.user._id });
    if (!restaurant) {
        return next(new AppError('You can only delete items in your own restaurant', 403));
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    success(res, null, 204);
});
