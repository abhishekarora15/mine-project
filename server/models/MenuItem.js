const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    price: {
        type: Number,
        required: true,
    },
    image: String,
    category: {
        type: String, // e.g., Starter, Main Course, Beverage
        required: true,
    },
    isVeg: {
        type: Boolean,
        default: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    customizations: [{
        title: String, // e.g., Choice of Bread
        options: [{
            name: String,
            price: Number,
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
