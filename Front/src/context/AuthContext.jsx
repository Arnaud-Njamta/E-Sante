import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { ROLES } from '../config/branding';
import { applyLanguageFromProfile } from '../i18n/syncLanguage';
import { prefetchPatientCore } from '../utils/routePrefetch';

const AuthContext = createContext(null);

const ROLE_KEY = 'esante_user_role';

const readRoleFromToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.role || null;
    } catch {
        return null;
    }
};

const clearStoredAuth = () => {
    localStorage.removeItem('esante_access_token');
    localStorage.removeItem('esante_refresh_token');
    localStorage.removeItem(ROLE_KEY);
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(ROLES.PATIENT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('esante_access_token');
        if (token) {
            const tokenRole = readRoleFromToken(token);
            if (tokenRole) setRole(tokenRole);
            fetchProfile();
        } else {
            clearStoredAuth();
            setLoading(false);
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('esante_access_token');
            const tokenRole = token ? readRoleFromToken(token) : null;
            const { data } = await client.get(ENDPOINTS.auth.me);
            const result = data.data || data;
            const resolvedRole = result.role || tokenRole || ROLES.PATIENT;
            const profile = result.user || result.patient || result.medecin || result;
            setUser(profile);
            setRole(resolvedRole);
            localStorage.setItem(ROLE_KEY, resolvedRole);
            applyLanguageFromProfile(profile);
            if (resolvedRole === ROLES.PATIENT) prefetchPatientCore();
        } catch {
            clearStoredAuth();
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
        flushSync(() => {
            setUser(profile);
            setRole(userRole);
        });
        applyLanguageFromProfile(profile);
        if (userRole === ROLES.PATIENT) prefetchPatientCore();
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
        clearStoredAuth();
        setUser(null);
        setRole(ROLES.PATIENT);
    }, []);

    const updateProfile = useCallback(async (payload) => {
        const { data } = await client.put(ENDPOINTS.patients.profile, payload);
        const result = data.data || data;
        const profile = result.user || result.patient || result;
        setUser(profile);
        if (payload.langue) applyLanguageFromProfile(profile);
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
