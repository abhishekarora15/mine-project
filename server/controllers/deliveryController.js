const Order = require('../models/Order');
const DeliveryProfile = require('../models/DeliveryProfile');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { success } = require('../utils/responseFormatter');
const { emitStatusUpdate } = require('../utils/socketHandler');

exports.getAssignedOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({
        deliveryPartnerId: req.user._id,
        orderStatus: { $in: ['confirmed', 'picked_up', 'out_for_delivery'] }
    }).populate('restaurantId');

    success(res, { orders });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const orderId = req.params.id;

    const allowedStatuses = ['picked_up', 'out_for_delivery', 'delivered'];
    if (!allowedStatuses.includes(status)) {
        return next(new AppError('Invalid status update', 400));
    }

    const order = await Order.findOneAndUpdate(
        { _id: orderId, deliveryPartnerId: req.user._id },
        { orderStatus: status },
        { new: true, runValidators: true }
    );

    if (!order) {
        return next(new AppError('Order not found or not assigned to you', 404));
    }

    // If delivered, update earnings and total deliveries
    if (status === 'delivered') {
        const commission = order.deliveryCharge || 40; // Default commission
        await DeliveryProfile.findOneAndUpdate(
            { userId: req.user._id },
            {
                $inc: { earningsTotal: commission, totalDeliveries: 1 },
                isAvailable: true // Make partner available again
            }
        );

        // Update order with actual earnings if needed
        order.totalEarnings = commission;
        await order.save();
    }

    emitStatusUpdate(order._id, status, { order });

    success(res, { order });
});

exports.updateLocation = catchAsync(async (req, res, next) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return next(new AppError('Please provide latitude and longitude', 400));
    }

    const profile = await DeliveryProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
            currentLocation: {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        },
        { new: true }
    );

    if (!profile) {
        return next(new AppError('Delivery profile not found', 404));
    }

    success(res, { profile });
});

exports.toggleAvailability = catchAsync(async (req, res, next) => {
    const { isAvailable } = req.body;

    const profile = await DeliveryProfile.findOneAndUpdate(
        { userId: req.user._id },
        { isAvailable },
        { new: true }
    );

    if (!profile) {
        return next(new AppError('Delivery profile not found', 404));
    }

    success(res, { profile });
});

exports.getDashboard = catchAsync(async (req, res, next) => {
    const profile = await DeliveryProfile.findOne({ userId: req.user._id });

    if (!profile) {
        return next(new AppError('Delivery profile not found', 404));
    }

    const activeOrdersCount = await Order.countDocuments({
        deliveryPartnerId: req.user._id,
        orderStatus: { $in: ['confirmed', 'picked_up', 'out_for_delivery'] }
    });

    success(res, {
        earningsTotal: profile.earningsTotal,
        totalDeliveries: profile.totalDeliveries,
        rating: profile.rating,
        isAvailable: profile.isAvailable,
        activeOrders: activeOrdersCount
    });
});
