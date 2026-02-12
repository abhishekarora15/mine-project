const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

exports.createOrder = async (req, res) => {
    try {
        const { restaurantId, items, totalAmount, deliveryAddress } = req.body;

        const newOrder = await Order.create({
            customerId: req.user._id,
            restaurantId,
            items,
            totalAmount,
            deliveryAddress,
        });

        // Notify restaurant via Socket.io
        req.io.to(restaurantId).emit('new_order', newOrder);

        res.status(201).json({
            status: 'success',
            data: {
                order: newOrder,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user._id }).sort('-createdAt');
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getRestaurantOrders = async (req, res) => {
    try {
        const orders = await Order.find({ restaurantId: req.params.restaurantId }).sort('-createdAt');
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'No order found' });
        }

        // Emit socket event for real-time tracking
        req.io.to(order._id.toString()).emit('order_status_update', order);

        // If status is OUT_FOR_DELIVERY, notify customer room specifically if needed
        // req.io.to(order.customerId.toString()).emit('delivery_update', order);

        res.status(200).json({
            status: 'success',
            data: {
                order,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};
