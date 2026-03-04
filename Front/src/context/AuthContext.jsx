import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('esante_access_token');
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await client.get(ENDPOINTS.patients.profile);
            const result = data.data || data;
            setUser(result.patient || result);
        } catch {
            localStorage.removeItem('esante_access_token');
            localStorage.removeItem('esante_refresh_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = useCallback(async (email, password) => {
        const { data } = await client.post(ENDPOINTS.auth.login, { email, password });
        const result = data.data || data;
        localStorage.setItem('esante_access_token', result.token || result.accessToken);
        if (result.refreshToken) {
            localStorage.setItem('esante_refresh_token', result.refreshToken);
        }
        setUser(result.patient || result.user);
        return result;
    }, []);

    const register = useCallback(async (payload) => {
        const { data } = await client.post(ENDPOINTS.auth.register, payload);
        const result = data.data || data;
        localStorage.setItem('esante_access_token', result.token || result.accessToken);
        if (result.refreshToken) {
            localStorage.setItem('esante_refresh_token', result.refreshToken);
        }
        setUser(result.patient || result.user);
        return result;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('esante_access_token');
        localStorage.removeItem('esante_refresh_token');
        setUser(null);
    }, []);

    const updateProfile = useCallback(async (payload) => {
        const { data } = await client.put(ENDPOINTS.patients.profile, payload);
        const result = data.data || data;
        setUser(result.patient || result);
        return result;
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
