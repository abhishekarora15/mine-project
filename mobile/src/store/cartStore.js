import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_URL } from '../constants/config';
import useAuthStore from './authStore';

const useCartStore = create((set, get) => ({
    items: [],
    restaurant: null,
    deliveryFee: 40,
    taxRate: 0.05, // 5%
    loading: false,
    error: null,

    fetchCart: async () => {
        const { token } = useAuthStore.getState();
        if (!token) return;

        set({ loading: true });
        try {
            const response = await axios.get(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.data.cart) {
                const { items, restaurantId, deliveryCharge, tax } = response.data.data.cart;
                set({
                    items,
                    restaurant: restaurantId,
                    deliveryFee: deliveryCharge,
                    taxRate: 0.05, // Assuming constant for now
                    loading: false
                });
            } else {
                set({ items: [], restaurant: null, loading: false });
            }
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error fetching cart', loading: false });
        }
    },

    addItem: async (product, restaurant) => {
        const { token } = useAuthStore.getState();
        if (!token) {
            Alert.alert('Login Required', 'Please login to add items to your cart.');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/cart`, {
                menuItemId: product._id,
                restaurantId: restaurant._id,
                quantity: 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            set({
                items: response.data.data.cart.items,
                restaurant: response.data.data.cart.restaurantId,
            });
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Error adding to cart';
            set({ error: errorMsg });
            Alert.alert('Error', errorMsg);
        }
    },

    updateQuantity: async (menuItemId, delta) => {
        const { token } = useAuthStore.getState();
        const { items } = get();
        if (!token) return;

        const currentItem = items.find(i => i.menuItemId === menuItemId);
        if (!currentItem) return;

        const newQuantity = currentItem.quantity + delta;

        try {
            const response = await axios.patch(`${API_URL}/cart/update`, {
                menuItemId,
                quantity: newQuantity
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            set({
                items: response.data.data.cart.items,
                restaurant: response.data.data.cart.items.length === 0 ? null : response.data.data.cart.restaurantId
            });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error updating quantity' });
        }
    },

    clearCart: async () => {
        const { token } = useAuthStore.getState();
        if (!token) return;

        try {
            await axios.delete(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ items: [], restaurant: null });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error clearing cart' });
        }
    },

    getBillDetails: () => {
        const { items, deliveryFee, taxRate } = get();
        const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
        const tax = subtotal * taxRate;
        const total = subtotal + tax + (subtotal > 0 ? deliveryFee : 0);

        return {
            subtotal,
            tax,
            deliveryFee: subtotal > 0 ? deliveryFee : 0,
            total
        };
    },

    getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
    }
}));

export default useCartStore;
