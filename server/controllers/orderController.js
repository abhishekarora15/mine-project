const Order = require('../models/Order');
const { success, error } = require('../utils/responseFormatter');
const razorpay = require('../utils/razorpay');

exports.createOrder = async (req, res) => {
    try {
        const { restaurantId, items, totalAmount, deliveryAddress, deliveryFee } = req.body;

        // 1) Handle Razorpay Order Creation if needed
        const razorpayOrder = await razorpay.createOrder(totalAmount);

        const newOrder = await Order.create({
            customerId: req.user._id,
            restaurantId,
            items,
            totalAmount,
            deliveryFee,
            deliveryAddress,
            paymentId: razorpayOrder.id,
        });

        // Notify restaurant via Socket.io
        req.io.to(restaurantId).emit('new_order', newOrder);

        success(res, { order: newOrder, razorpayOrder }, 201);
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const isValid = razorpay.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isValid) {
            await Order.findByIdAndUpdate(orderId, { paymentStatus: 'FAILED' });
            return error(res, 'Invalid payment signature', 400);
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: 'PAID',
                status: 'CONFIRMED'
            },
            { new: true }
        );

        success(res, { order: updatedOrder });
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user._id }).sort('-createdAt');
        success(res, { orders });
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.getRestaurantOrders = async (req, res) => {
    try {
        const orders = await Order.find({ restaurantId: req.params.restaurantId }).sort('-createdAt');
        success(res, { orders });
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!order) {
            return error(res, 'No order found', 404);
        }

        req.io.to(order._id.toString()).emit('order_status_update', order);

        success(res, { order });
    } catch (err) {
        error(res, err.message, 400);
    }
};
