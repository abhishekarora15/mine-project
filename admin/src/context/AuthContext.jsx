import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.data.user.role === 'RESTAURANT_OWNER' || data.data.user.role === 'ADMIN') {
                setUser(data.data.user);
            } else {
                logout();
            }
        } catch (err) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (data.data.user.role === 'RESTAURANT_OWNER' || data.data.user.role === 'ADMIN') {
            localStorage.setItem('adminToken', data.token);
            setUser(data.data.user);
            return data.data.user;
        } else {
            throw new Error('You do not have permission to access the admin panel');
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
