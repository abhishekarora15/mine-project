const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    cuisineTypes: [String],
    image: String, // URL from Cloudinary
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true,
        },
        address: String,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isCloudKitchen: {
        type: Boolean,
        default: false,
    },
    isOpen: {
        type: Boolean,
        default: true,
    },
    preparationTime: {
        type: String, // e.g., "20-30 mins"
        default: "30 mins",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Geo-spatial index for location-based search
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
