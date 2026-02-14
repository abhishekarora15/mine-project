const Restaurant = require('../models/Restaurant');
const { success, error } = require('../utils/responseFormatter');

exports.createRestaurant = async (req, res) => {
    try {
        const { name, description, cuisineTypes, location, isCloudKitchen, image } = req.body;

        const newRestaurant = await Restaurant.create({
            ownerId: req.user._id,
            name,
            description,
            cuisineTypes,
            location,
            isCloudKitchen,
            image
        });

        success(res, { restaurant: newRestaurant }, 201);
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.getAllRestaurants = async (req, res) => {
    try {
        const { lat, lng, radius = 5000, cuisine } = req.query; // radius in meters
        let query = {};

        // 1) Location-based filtering (Geospatial)
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: parseInt(radius),
                },
            };
        }

        // 2) Cuisine filtering
        if (cuisine) {
            query.cuisineTypes = { $in: cuisine.split(',') };
        }

        const restaurants = await Restaurant.find(query);
        success(res, { restaurants });
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.getRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return error(res, 'No restaurant found with that ID', 404);
        }
        success(res, { restaurant });
    } catch (err) {
        error(res, err.message, 400);
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
            return error(res, 'No restaurant found or you are not the owner', 404);
        }

        success(res, { restaurant });
    } catch (err) {
        error(res, err.message, 400);
    }
};
