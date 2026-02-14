const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { success, error } = require('../utils/responseFormatter');

exports.createMenuItem = async (req, res) => {
    try {
        // Check if the restaurant belongs to the user
        const restaurant = await Restaurant.findOne({ _id: req.body.restaurantId, ownerId: req.user._id });
        if (!restaurant) {
            return error(res, 'You can only add items to your own restaurant', 403);
        }

        const newItem = await MenuItem.create(req.body);
        success(res, { menuItem: newItem }, 201);
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.getRestaurantMenu = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ restaurantId: req.params.restaurantId });
        success(res, { menuItems });
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return error(res, 'No menu item found', 404);
        }

        const restaurant = await Restaurant.findOne({ _id: menuItem.restaurantId, ownerId: req.user._id });
        if (!restaurant) {
            return error(res, 'You can only update items in your own restaurant', 403);
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        success(res, { menuItem: updatedItem });
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return error(res, 'No menu item found', 404);
        }

        const restaurant = await Restaurant.findOne({ _id: menuItem.restaurantId, ownerId: req.user._id });
        if (!restaurant) {
            return error(res, 'You can only delete items in your own restaurant', 403);
        }

        await MenuItem.findByIdAndDelete(req.params.id);
        success(res, null, 204);
    } catch (err) {
        error(res, err.message, 400);
    }
};
