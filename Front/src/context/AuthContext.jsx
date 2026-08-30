import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { ROLES } from '../config/branding';

const AuthContext = createContext(null);

const ROLE_KEY = 'esante_user_role';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(ROLES.PATIENT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('esante_access_token');
        const savedRole = localStorage.getItem(ROLE_KEY);
        if (savedRole) setRole(savedRole);
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await client.get(ENDPOINTS.auth.me);
            const result = data.data || data;
            setUser(result.user);
            setRole(result.role || ROLES.PATIENT);
            localStorage.setItem(ROLE_KEY, result.role || ROLES.PATIENT);
        } catch {
            localStorage.removeItem('esante_access_token');
            localStorage.removeItem('esante_refresh_token');
            localStorage.removeItem(ROLE_KEY);
            setUser(null);
            setRole(ROLES.PATIENT);
        } finally {
            setLoading(false);
        }
    };

    const applyAuthResult = useCallback((result) => {
        const userRole = result.role || ROLES.PATIENT;
        const profile = result.user || result.patient || result.medecin || result.pharmacie || result.hopital || result.clinique || result.admin;
        localStorage.setItem('esante_access_token', result.token || result.accessToken);
        if (result.refreshToken) {
            localStorage.setItem('esante_refresh_token', result.refreshToken);
        }
        localStorage.setItem(ROLE_KEY, userRole);
        setUser(profile);
        setRole(userRole);
        return { user: profile, role: userRole };
    }, []);

    const login = useCallback(async (email, password) => {
        const { data } = await client.post(ENDPOINTS.auth.login, { email, password });
        const result = data.data || data;
        return applyAuthResult(result);
    }, [applyAuthResult]);

    const register = useCallback(async (payload) => {
        const { data } = await client.post(ENDPOINTS.auth.register, payload);
        const result = data.data || data;
        return applyAuthResult(result);
    }, [applyAuthResult]);

    const logout = useCallback(() => {
        localStorage.removeItem('esante_access_token');
        localStorage.removeItem('esante_refresh_token');
        localStorage.removeItem(ROLE_KEY);
        setUser(null);
        setRole(ROLES.PATIENT);
    }, []);

    const updateProfile = useCallback(async (payload) => {
        const { data } = await client.put(ENDPOINTS.patients.profile, payload);
        const result = data.data || data;
        setUser(result.user || result.patient || result);
        return result;
    }, []);

    const value = {
        user,
        role,
        loading,
        isAuthenticated: !!user,
        isPatient: role === ROLES.PATIENT,
        isMedecin: role === ROLES.MEDECIN,
        isPharmacie: role === ROLES.PHARMACIE,
        isHopital: role === ROLES.HOPITAL,
        isClinique: role === ROLES.CLINIQUE,
        isAdmin: role === ROLES.ADMIN,
        isStructure: [ROLES.PHARMACIE, ROLES.HOPITAL, ROLES.CLINIQUE].includes(role),
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
