import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../constants/config';

const useRestaurantStore = create((set) => ({
    restaurants: [],
    loading: false,
    error: null,
    currentMenu: [],

    fetchRestaurants: async (lat, lng) => {
        set({ loading: true, error: null });
        try {
            const url = lat && lng
                ? `${API_URL}/restaurants?lat=${lat}&lng=${lng}&radius=5000`
                : `${API_URL}/restaurants`;

            const response = await axios.get(url);
            set({
                restaurants: response.data.data.restaurants,
                loading: false
            });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error fetching restaurants',
                loading: false
            });
        }
    },

    fetchRestaurantMenu: async (restaurantId) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/restaurants/${restaurantId}/menu`);
            set({
                currentMenu: response.data.data.menuItems || [],
                loading: false
            });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error fetching menu',
                loading: false
            });
        }
    },
}));

export default useRestaurantStore;
