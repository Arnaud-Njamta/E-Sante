import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHomeRoute } from '../config/branding';
import Spinner from '../components/ui/Spinner';

export default function RoleRoute({ allowedRoles }) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner fullPage text="Chargement..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeRoute(role)} replace />;
  }

  return <Outlet />;
}
