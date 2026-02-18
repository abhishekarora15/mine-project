const Order = require('../models/Order');
const Cart = require('../models/Cart');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { success } = require('../utils/responseFormatter');
const { assignDeliveryPartner } = require('../utils/assignmentLogic');
const { emitStatusUpdate } = require('../utils/socketHandler');
const notificationService = require('../services/notificationService');
const Restaurant = require('../models/Restaurant');

exports.createOrder = catchAsync(async (req, res, next) => {
    const { deliveryAddress, paymentMethod = 'COD' } = req.body;

    // 1) Find the user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
        return next(new AppError('Your cart is empty', 400));
    }

    // 2) Verify totals
    const { items, restaurantId, subtotal, deliveryCharge, tax, total } = cart;

    // 3) Create the order (gateway-agnostic)
    const newOrder = await Order.create({
        userId: req.user._id,
        restaurantId,
        items: items.map(item => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
        })),
        subtotal,
        deliveryCharge,
        tax,
        totalAmount: total,
        deliveryAddress,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending'
    });


    // 4) Notify restaurant via Socket.io
    if (req.io) {
        req.io.to(restaurantId.toString()).emit('new_order', newOrder);
    }

    // 5) Notify restaurant owner via Push Notification
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) {
        notificationService.sendPushNotification(
            restaurant.ownerId,
            'New Order Received! 🍕',
            `Order #${newOrder._id.toString().slice(-6)} received for ₹${total}`,
            { orderId: newOrder._id.toString(), type: 'new_order' }
        );
    }

    // If COD, we can confirm immediately or wait for restaurant approval
    // For online payments, the frontend will now call the payment service
    success(res, { order: newOrder }, 201);
});

// verifyPayment moved to paymentController


exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ userId: req.user._id }).sort('-createdAt').populate('restaurantId');
    success(res, { orders });
});

exports.getOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('restaurantId').populate('deliveryPartnerId', 'name phone');
    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    if (order.userId.toString() !== req.user._id.toString() && req.user.role === 'customer') {
        return next(new AppError('You do not have permission to view this order', 403));
    }

    success(res, { order });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true, runValidators: true });

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    // AUTO ASSIGN if status becomes confirmed (e.g. by manual admin action)
    if (status === 'confirmed' && !order.deliveryPartnerId) {
        await assignDeliveryPartner(order._id);
    }

    emitStatusUpdate(order._id, status, { order });

    // 4) Send Push Notification to customer
    let title = 'Order Update';
    let body = `Your order status is now ${status.replace('_', ' ')}`;

    if (status === 'out_for_delivery') {
        title = 'Out for Delivery! 🛵';
        body = 'Your food is on the way!';
    } else if (status === 'delivered') {
        title = 'Order Delivered! 🍽️';
        body = 'Enjoy your meal!';
    } else if (status === 'cancelled') {
        title = 'Order Cancelled ❌';
        body = 'Your order has been cancelled.';
    }

    notificationService.sendPushNotification(
        order.userId,
        title,
        body,
        { orderId: order._id.toString(), status, type: 'status_update' }
    );

    success(res, { order });
});

exports.getRestaurantOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ restaurantId: req.params.restaurantId })
        .sort('-createdAt')
        .populate('userId', 'name phone');
    success(res, { orders });
});

