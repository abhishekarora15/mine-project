const { Cashfree } = require('../config/cashfree');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { success } = require('../utils/responseFormatter');
const { assignDeliveryPartner } = require('../utils/assignmentLogic');
const notificationService = require('../services/notificationService');

exports.createCashfreeOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    if (order.paymentStatus === 'paid') {
        return next(new AppError('Order is already paid', 400));
    }

    const request = {
        order_amount: order.totalAmount,
        order_currency: "INR",
        order_id: order._id.toString(),
        customer_details: {
            customer_id: order.userId.toString(),
            customer_phone: req.user.phone || "9999999999",
            customer_email: req.user.email || "customer@example.com"
        },
        order_meta: {
            return_url: `${process.env.FRONTEND_URL}/payment-status?order_id={order_id}`,
            notify_url: `${process.env.BACKEND_URL}/api/v1/payment/webhook`
        }
    };

    try {
        const response = await Cashfree.PGCreateOrder("2023-08-01", request);

        const cfData = response.data;

        order.cfOrderId = cfData.cf_order_id;
        order.paymentSessionId = cfData.payment_session_id;
        order.paymentProvider = 'cashfree';
        await order.save();

        success(res, {
            paymentSessionId: cfData.payment_session_id,
            cfOrderId: cfData.cf_order_id,
            orderId: order._id
        });
    } catch (error) {
        console.error('Cashfree Create Order Error:', error.response?.data || error.message);
        return next(new AppError('Failed to initiate payment with Cashfree', 500));
    }
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    try {
        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", order._id.toString());
        const payments = response.data;

        const successfulPayment = payments.find(p => p.payment_status === 'SUCCESS');

        if (successfulPayment) {
            if (order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                order.orderStatus = 'confirmed';
                order.paymentId = successfulPayment.cf_payment_id.toString();
                await order.save();

                // Clear Cart
                await Cart.findOneAndDelete({ userId: order.userId });

                // Assign Delivery Partner
                await assignDeliveryPartner(order._id);

                // Notify Customer
                notificationService.sendPushNotification(
                    order.userId,
                    'Order Confirmed! ✅',
                    'Your payment was successful and your order is being prepared.',
                    { orderId: order._id.toString(), type: 'order_confirmed' }
                );
            }
            return success(res, { status: 'paid', order });
        } else {
            return success(res, { status: 'pending/failed', order });
        }
    } catch (error) {
        console.error('Cashfree Verify Error:', error.response?.data || error.message);
        return next(new AppError('Failed to verify payment', 500));
    }
});

exports.handleWebhook = catchAsync(async (req, res, next) => {
    // Note: In production, use Cashfree.PGVerifyWebhookSignature to verify the request
    const { data } = req.body;
    const { order, payment } = data;

    if (payment.payment_status === 'SUCCESS') {
        const localOrder = await Order.findById(order.order_id);

        if (localOrder && localOrder.paymentStatus !== 'paid') {
            localOrder.paymentStatus = 'paid';
            localOrder.orderStatus = 'confirmed';
            localOrder.paymentId = payment.cf_payment_id.toString();
            await localOrder.save();

            await Cart.findOneAndDelete({ userId: localOrder.userId });
            await assignDeliveryPartner(localOrder._id);

            notificationService.sendPushNotification(
                localOrder.userId,
                'Payment Successful! 🎉',
                'Your order has been confirmed via webhook.',
                { orderId: localOrder._id.toString(), type: 'payment_success' }
            );
        }
    }

    res.status(200).json({ status: 'OK' });
});
