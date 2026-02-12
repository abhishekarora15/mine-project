const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

exports.createMenuItem = async (req, res) => {
    try {
        // Check if the restaurant belongs to the user
        const restaurant = await Restaurant.findOne({ _id: req.body.restaurantId, ownerId: req.user._id });
        if (!restaurant) {
            return res.status(403).json({ status: 'fail', message: 'You can only add items to your own restaurant' });
        }

        const newItem = await MenuItem.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                menuItem: newItem,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getRestaurantMenu = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ restaurantId: req.params.restaurantId });
        res.status(200).json({
            status: 'success',
            results: menuItems.length,
            data: {
                menuItems,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ status: 'fail', message: 'No menu item found' });
        }

        const restaurant = await Restaurant.findOne({ _id: menuItem.restaurantId, ownerId: req.user._id });
        if (!restaurant) {
            return res.status(403).json({ status: 'fail', message: 'You can only update items in your own restaurant' });
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        res.status(200).json({
            status: 'success',
            data: {
                menuItem: updatedItem,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ status: 'fail', message: 'No menu item found' });
        }

        const restaurant = await Restaurant.findOne({ _id: menuItem.restaurantId, ownerId: req.user._id });
        if (!restaurant) {
            return res.status(403).json({ status: 'fail', message: 'You can only delete items in your own restaurant' });
        }

        await MenuItem.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};
