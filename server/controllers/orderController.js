const Order = require('../models/Order');
const Cart = require('../models/Cart');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { success } = require('../utils/responseFormatter');
const phonepe = require('../utils/phonepe');
const { assignDeliveryPartner } = require('../utils/assignmentLogic');
const { emitStatusUpdate } = require('../utils/socketHandler');
const notificationService = require('../services/notificationService');
const Restaurant = require('../models/Restaurant');

exports.createOrder = catchAsync(async (req, res, next) => {
    const { deliveryAddress, paymentMethod = 'RAZORPAY' } = req.body;

    // 1) Find the user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
        return next(new AppError('Your cart is empty', 400));
    }

    // 2) Verify totals
    const { items, restaurantId, subtotal, deliveryCharge, tax, total } = cart;

    // 3) Handle Payment Initiation
    let paymentId = null;
    let paymentUrl = null;

    // We create the order first, then get the payment link from PhonePe
    // This ensures we have a local order ID to track the transaction

    // 4) Create the order
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
        paymentId
    });

    // 5) Notify restaurant via Socket.io
    if (req.io) {
        req.io.to(restaurantId.toString()).emit('new_order', newOrder);
    }

    // 5.1) Notify restaurant owner via Push Notification
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) {
        notificationService.sendPushNotification(
            restaurant.ownerId,
            'New Order Received! 🍕',
            `Order #${newOrder._id.toString().slice(-6)} received for ₹${total}`,
            { orderId: newOrder._id.toString(), type: 'new_order' }
        );
    }

    // 5.2) Initiate PhonePe Payment
    const phonepeResponse = await phonepe.initiatePayment(newOrder._id, total, req.user.phone || '9999999999');
    newOrder.paymentId = phonepeResponse.merchantTransactionId;
    await newOrder.save();

    success(res, { order: newOrder, paymentUrl: phonepeResponse.redirectUrl }, 201);
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
    const { merchantTransactionId } = req.body;

    const statusResponse = await phonepe.checkStatus(merchantTransactionId);

    if (statusResponse.code !== 'PAYMENT_SUCCESS') {
        await Order.findOneAndUpdate({ paymentId: merchantTransactionId }, { paymentStatus: 'failed' });
        return next(new AppError(`Payment failed: ${statusResponse.message}`, 400));
    }

    const updatedOrder = await Order.findOneAndUpdate(
        { paymentId: merchantTransactionId },
        {
            paymentStatus: 'paid',
            orderStatus: 'confirmed'
        },
        { new: true }
    );

    if (!updatedOrder) {
        return next(new AppError('Order not found', 404));
    }

    const orderId = updatedOrder._id;

    // CLEAR CART
    await Cart.findOneAndDelete({ userId: updatedOrder.userId });

    // AUTO ASSIGN DELIVERY PARTNER
    await assignDeliveryPartner(orderId);

    // 6) Notify customer of successful payment and order confirmation
    notificationService.sendPushNotification(
        updatedOrder.userId,
        'Order Confirmed! ✅',
        'Your payment was successful and your order is being prepared.',
        { orderId: orderId.toString(), type: 'order_confirmed' }
    );

    success(res, { order: updatedOrder });
});

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

exports.handlePhonePeCallback = catchAsync(async (req, res, next) => {
    const { response } = req.body;
    if (!response) {
        return res.status(400).send('Invalid callback payload');
    }

    const decodedPayload = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'));
    const { code, merchantTransactionId } = decodedPayload;

    if (code === 'PAYMENT_SUCCESS') {
        const order = await Order.findOneAndUpdate(
            { paymentId: merchantTransactionId },
            {
                paymentStatus: 'paid',
                orderStatus: 'confirmed'
            },
            { new: true }
        );

        if (order) {
            await Cart.findOneAndDelete({ userId: order.userId });
            await assignDeliveryPartner(order._id);

            notificationService.sendPushNotification(
                order.userId,
                'Payment Successful! 🎉',
                'Your order has been confirmed.',
                { orderId: order._id.toString(), type: 'payment_success' }
            );
        }
    } else {
        await Order.findOneAndUpdate({ paymentId: merchantTransactionId }, { paymentStatus: 'failed' });
    }

    res.status(200).send('OK');
});
