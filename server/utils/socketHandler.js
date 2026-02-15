const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // JWT Authentication Middleware for Sockets
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.token;
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`📡 Connected: ${socket.user.name} (${socket.user.role})`);

        // Join specific order room
        socket.on('join_order', (orderId) => {
            socket.join(`order_${orderId}`);
            console.log(`🏠 User ${socket.user.id} joined room: order_${orderId}`);
        });

        // Leave specific order room
        socket.on('leave_order', (orderId) => {
            socket.leave(`order_${orderId}`);
            console.log(`🚪 User ${socket.user.id} left room: order_${orderId}`);
        });

        // Handle live location updates from delivery partner
        socket.on('update_location', (data) => {
            const { orderId, latitude, longitude } = data;

            if (socket.user.role !== 'delivery') return;

            // Broadcast to everyone in the order room (customer, restaurant)
            io.to(`order_${orderId}`).emit('delivery_location_update', {
                orderId,
                latitude,
                longitude,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Disconnected: ${socket.user.name}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Helper to broadcast status updates
const emitStatusUpdate = (orderId, status, data) => {
    if (io) {
        io.to(`order_${orderId}`).emit('order_status_update', {
            orderId,
            status,
            ...data
        });
    }
};

module.exports = { initSocket, getIO, emitStatusUpdate };
