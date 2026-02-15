const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    items: [{
        menuItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true,
        },
        name: String,
        quantity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        subtotal: Number
    }],
    subtotal: {
        type: Number,
        required: true,
    },
    deliveryCharge: {
        type: Number,
        default: 40,
    },
    tax: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    deliveryAddress: {
        street: String,
        city: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    deliveryPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'CARD', 'COD', 'RAZORPAY'],
        default: 'RAZORPAY',
    },
    paymentId: String,
    totalEarnings: Number, // Commission for delivery partner
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);
