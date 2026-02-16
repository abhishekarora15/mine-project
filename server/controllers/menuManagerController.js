const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { success } = require('../utils/responseFormatter');

/**
 * Utility to verify if the restaurant belongs to the user
 */
const verifyOwnership = async (userId, restaurantId) => {
    const restaurant = await Restaurant.findOne({ _id: restaurantId, ownerId: userId });
    if (!restaurant) {
        throw new AppError('You do not have permission to manage this restaurant menu', 403);
    }
    return restaurant;
};

exports.createMenuItem = catchAsync(async (req, res, next) => {
    const { restaurantId } = req.body;
    await verifyOwnership(req.user._id, restaurantId);

    const newItem = await MenuItem.create(req.body);
    success(res, { item: newItem }, 201);
});

exports.updateMenuItem = catchAsync(async (req, res, next) => {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
        return next(new AppError('No menu item found with that ID', 404));
    }

    await verifyOwnership(req.user._id, item.restaurantId);

    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    success(res, { item: updatedItem });
});

exports.deleteMenuItem = catchAsync(async (req, res, next) => {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
        return next(new AppError('No menu item found with that ID', 404));
    }

    await verifyOwnership(req.user._id, item.restaurantId);

    await MenuItem.findByIdAndDelete(req.params.id);
    success(res, null, 204);
});

exports.getRestaurantMenu = catchAsync(async (req, res, next) => {
    const { restaurantId } = req.params;
    // Ownership check optional for just viewing, but good for admin flow
    await verifyOwnership(req.user._id, restaurantId);

    const items = await MenuItem.find({ restaurantId });
    success(res, { items });
});
