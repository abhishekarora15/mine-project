import { create } from 'zustand';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

const TOKEN_KEY = 'auth_token';

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
            const { token, user } = response.data.data;

            await SecureStore.setItemAsync(TOKEN_KEY, token);

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Network error - please check your connection';
            set({ error: message, loading: false });
            return { success: false, message: message };
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            const { token, user } = response.data.data;

            await SecureStore.setItemAsync(TOKEN_KEY, token);

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Registration failed';
            set({ error: message, loading: false });
            return { success: false, message: message };
        }
    },

    logout: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        set({
            user: null,
            token: null,
            isAuthenticated: false
        });
    },

    loadUser: async () => {
        set({ loading: true });
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (!token) {
                set({ loading: false, isAuthenticated: false });
                return;
            }

            const response = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            set({
                user: response.data.data.user,
                token,
                isAuthenticated: true,
                loading: false
            });
        } catch (error) {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            set({ user: null, token: null, isAuthenticated: false, loading: false });
        }
    }
}));

export default useAuthStore;
