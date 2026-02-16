const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { success } = require('../utils/responseFormatter');

/**
 * Utility to get the user's restaurant
 */
const getMyRestaurant = async (userId) => {
    const restaurant = await Restaurant.findOne({ ownerId: userId });
    if (!restaurant) {
        throw new AppError('No restaurant found for this owner', 404);
    }
    return restaurant;
};

exports.getDashboardStats = catchAsync(async (req, res, next) => {
    const restaurant = await getMyRestaurant(req.user._id);
    const restaurantId = restaurant._id;

    // 1) General metrics
    const stats = await Order.aggregate([
        { $match: { restaurantId: restaurantId, paymentStatus: 'paid' } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                pendingOrders: {
                    $sum: {
                        $cond: [{ $in: ['$orderStatus', ['pending', 'confirmed', 'preparing']] }, 1, 0]
                    }
                }
            }
        }
    ]);

    // 2) Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await Order.aggregate([
        {
            $match: {
                restaurantId: restaurantId,
                paymentStatus: 'paid',
                createdAt: { $gte: today }
            }
        },
        {
            $group: {
                _id: null,
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 }
            }
        }
    ]);

    const result = {
        totalOrders: stats[0]?.totalOrders || 0,
        totalRevenue: stats[0]?.totalRevenue || 0,
        pendingOrders: stats[0]?.pendingOrders || 0,
        todayRevenue: todayStats[0]?.revenue || 0,
        todayOrders: todayStats[0]?.orders || 0,
        restaurant
    };

    success(res, result);
});

exports.getRestaurantOrders = catchAsync(async (req, res, next) => {
    const restaurant = await getMyRestaurant(req.user._id);

    const orders = await Order.find({ restaurantId: restaurant._id })
        .populate('userId', 'name email phone')
        .sort('-createdAt');

    success(res, { orders });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const restaurant = await getMyRestaurant(req.user._id);

    const order = await Order.findOne({
        _id: req.params.id,
        restaurantId: restaurant._id
    });

    if (!order) {
        return next(new AppError('No order found with that ID for your restaurant', 404));
    }

    // Business Logic: Don't allow updates to cancelled or delivered orders
    if (['delivered', 'cancelled'].includes(order.orderStatus)) {
        return next(new AppError(`Cannot update a ${order.orderStatus} order`, 400));
    }

    order.orderStatus = status;
    await order.save();

    // Trigger Socket.io update to User (Mobile App)
    if (req.io) {
        req.io.to(order.userId.toString()).emit('order_status_update', {
            orderId: order._id,
            status: status
        });
    }

    success(res, { order });
});
