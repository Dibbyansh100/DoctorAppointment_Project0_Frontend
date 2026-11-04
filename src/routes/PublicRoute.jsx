import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLES } from '../utils/constants';

/**
 * Route wrapper for public auth pages (Login, Register).
 * Automatically redirects already-authenticated users to their respective role dashboard.
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, userRole } = useAuth();

  if (isAuthenticated) {
    if (userRole === USER_ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === USER_ROLES.DOCTOR) {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}

export default PublicRoute;
