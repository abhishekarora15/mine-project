import { io } from 'socket.io-client';
import { API_URL } from '../constants/config';
import useAuthStore from '../store/authStore';

// The socket server usually runs on the same port as the API
const SOCKET_URL = API_URL.replace('/api', '');

let socket;

export const initiateSocketConnection = () => {
    const token = useAuthStore.getState().token;

    if (!token) return;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'], // Faster and more reliable for RN
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 5000,
    });

    console.log('🔌 Connecting to socket...');

    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        console.log('🔌 Socket disconnected manually');
    }
};

export const joinOrderRoom = (orderId) => {
    if (socket) {
        socket.emit('join_order', orderId);
        console.log(`🏠 Joined order room: ${orderId}`);
    }
};

export const leaveOrderRoom = (orderId) => {
    if (socket) {
        socket.emit('leave_order', orderId);
        console.log(`🚪 Left order room: ${orderId}`);
    }
};

export const subscribeToStatusUpdates = (cb) => {
    if (!socket) return;
    socket.on('order_status_update', (data) => {
        console.log('📦 Order status update received:', data);
        cb(data);
    });
};

export const subscribeToLocationUpdates = (cb) => {
    if (!socket) return;
    socket.on('delivery_location_update', (data) => {
        console.log('📍 Location update received:', data);
        cb(data);
    });
};

export const updateDeliveryLocation = (data) => {
    if (socket) {
        socket.emit('update_location', data);
    }
};

export const getSocket = () => socket;
