import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import { updateDeliveryLocation, initiateSocketConnection, joinOrderRoom, leaveOrderRoom } from '../utils/socket';

const useDeliveryStore = create((set, get) => ({
    stats: {
        earningsTotal: 0,
        totalDeliveries: 0,
        rating: 5,
        isAvailable: false,
        activeOrders: 0
    },
    assignedOrders: [],
    loading: false,
    error: null,

    fetchDashboard: async () => {
        set({ loading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const res = await axios.get(`${BASE_URL}/delivery/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ stats: res.data.data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch dashboard', loading: false });
        }
    },

    fetchAssignedOrders: async () => {
        set({ loading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const res = await axios.get(`${BASE_URL}/delivery/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ assignedOrders: res.data.data.orders, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch orders', loading: false });
        }
    },

    updateOrderStatus: async (orderId, status) => {
        set({ loading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            await axios.patch(`${BASE_URL}/delivery/orders/${orderId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await get().fetchAssignedOrders();
            await get().fetchDashboard();
            set({ loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update order', loading: false });
        }
    },

    toggleAvailability: async (isAvailable) => {
        try {
            const token = useAuthStore.getState().token;
            await axios.patch(`${BASE_URL}/delivery/availability`, { isAvailable }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set((state) => ({ stats: { ...state.stats, isAvailable } }));
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update availability' });
        }
    },

    updateLocation: async (latitude, longitude, activeOrderId = null) => {
        try {
            const token = useAuthStore.getState().token;
            await axios.patch(`${BASE_URL}/delivery/location`, { latitude, longitude }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Emit via socket for real-time tracking if on an active order
            if (activeOrderId) {
                updateDeliveryLocation({
                    orderId: activeOrderId,
                    latitude,
                    longitude
                });
            }
        } catch (err) {
            console.error('Failed to update live location:', err);
        }
    },

    startTracking: (orderId) => {
        initiateSocketConnection();
        joinOrderRoom(orderId);
    },

    stopTracking: (orderId) => {
        leaveOrderRoom(orderId);
    }
}));

export default useDeliveryStore;
