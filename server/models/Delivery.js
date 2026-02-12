const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    deliveryPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true,
        },
    },
    status: {
        type: String,
        enum: ['ASSIGNED', 'PICKED_UP', 'DELIVERED'],
        default: 'ASSIGNED',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

deliverySchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);
