const Restaurant = require('../models/Restaurant');

exports.createRestaurant = async (req, res) => {
    try {
        const { name, description, cuisineTypes, location, isCloudKitchen } = req.body;

        const newRestaurant = await Restaurant.create({
            ownerId: req.user._id,
            name,
            description,
            cuisineTypes,
            location,
            isCloudKitchen,
        });

        res.status(201).json({
            status: 'success',
            data: {
                restaurant: newRestaurant,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json({
            status: 'success',
            results: restaurants.length,
            data: {
                restaurants,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ status: 'fail', message: 'No restaurant found with that ID' });
        }
        res.status(200).json({
            status: 'success',
            data: {
                restaurant,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            return res.status(404).json({ status: 'fail', message: 'No restaurant found or you are not the owner' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                restaurant,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};
