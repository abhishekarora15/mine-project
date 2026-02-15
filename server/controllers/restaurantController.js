const Restaurant = require('../models/Restaurant');
const { success } = require('../utils/responseFormatter');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createRestaurant = catchAsync(async (req, res, next) => {
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
});

exports.getAllRestaurants = catchAsync(async (req, res, next) => {
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
});

exports.getRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
        return next(new AppError('No restaurant found with that ID', 404));
    }
    success(res, { restaurant });
});

exports.updateRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findOneAndUpdate(
        { _id: req.params.id, ownerId: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!restaurant) {
        return next(new AppError('No restaurant found or you are not the owner', 404));
    }

    success(res, { restaurant });
});

exports.getMyRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
        return next(new AppError('No restaurant found for this owner', 404));
    }
    success(res, { restaurant });
});
