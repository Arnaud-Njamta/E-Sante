import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHomeRoute } from '../config/branding';
import PageContentSkeleton from '../components/ui/PageContentSkeleton';

export default function RoleRoute({ allowedRoles }) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();
  const hasToken = typeof localStorage !== 'undefined' && !!localStorage.getItem('esante_access_token');

  if (loading && !hasToken) {
    return <PageContentSkeleton />;
  }

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !loading && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeRoute(role)} replace />;
  }

  if (loading && hasToken) {
    return <Outlet />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeRoute(role)} replace />;
  }

  return <Outlet />;
}
