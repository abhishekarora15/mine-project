const Order = require('../models/Order');
const Cart = require('../models/Cart');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { success } = require('../utils/responseFormatter');
const razorpay = require('../utils/razorpay');
const { assignDeliveryPartner } = require('../utils/assignmentLogic');

exports.createOrder = catchAsync(async (req, res, next) => {
    const { deliveryAddress, paymentMethod = 'RAZORPAY' } = req.body;

    // 1) Find the user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
        return next(new AppError('Your cart is empty', 400));
    }

    // 2) Verify totals
    const { items, restaurantId, subtotal, deliveryCharge, tax, total } = cart;

    // 3) Handle Razorpay if selected
    let paymentId = null;
    let razorpayOrder = null;
    if (paymentMethod === 'RAZORPAY') {
        razorpayOrder = await razorpay.createOrder(total);
        paymentId = razorpayOrder.id;
    }

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

    success(res, { order: newOrder, razorpayOrder }, 201);
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = razorpay.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
        return next(new AppError('Invalid payment signature', 400));
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
            paymentStatus: 'paid',
            orderStatus: 'confirmed'
        },
        { new: true }
    );

    // CLEAR CART
    await Cart.findOneAndDelete({ userId: req.user._id });

    // AUTO ASSIGN DELIVERY PARTNER
    await assignDeliveryPartner(orderId);

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

    if (req.io) {
        req.io.to(order._id.toString()).emit('order_status_update', order);
    }

    success(res, { order });
});
