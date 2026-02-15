const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1.'],
        default: 1,
    },
    subtotal: {
        type: Number,
        required: true,
    },
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // One cart per user
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    items: [cartItemSchema],
    subtotal: {
        type: Number,
        default: 0,
    },
    deliveryCharge: {
        type: Number,
        default: 40,
    },
    tax: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        default: 0,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to calculate totals before saving
cartSchema.pre('save', function (next) {
    if (this.items.length === 0) {
        this.subtotal = 0;
        this.tax = 0;
        this.total = 0;
        this.deliveryCharge = 0;
        return next();
    }

    // Calculate subtotal
    this.subtotal = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // items subtotal should be updated too
    this.items.forEach(item => {
        item.subtotal = item.price * item.quantity;
    });

    // 5% tax
    this.tax = this.subtotal * 0.05;

    // Fixed delivery charge for now
    this.deliveryCharge = 40;

    // Grand total
    this.total = this.subtotal + this.tax + this.deliveryCharge;

    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Cart', cartSchema);
