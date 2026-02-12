import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../constants/config';

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            set({
                user: response.data.data.user,
                token: response.data.token,
                isAuthenticated: true,
                loading: false
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Network error - please check your connection';
            set({
                error: message,
                loading: false
            });
            return { success: false, message: message };
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            set({
                user: response.data.data.user,
                token: response.data.token,
                isAuthenticated: true,
                loading: false
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Network error - please check your connection';
            set({
                error: message,
                loading: false
            });
            return { success: false, message: message };
        }
    },

    logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
