import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Mode démo : mettre à true pour accéder à l'app sans backend
 * Mettre à false pour activer l'authentification réelle
 */
const DEMO_MODE = false;

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // En mode démo, on laisse passer directement
    if (DEMO_MODE) {
        return children;
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                color: '#64748B',
                fontSize: '1rem',
            }}>
                Chargement...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
