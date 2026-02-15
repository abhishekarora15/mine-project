const mongoose = require('mongoose');

const deliveryProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['bike', 'scooter', 'cycle'],
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    currentLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    earningsTotal: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 5
    },
    totalDeliveries: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

deliveryProfileSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryProfile', deliveryProfileSchema);
