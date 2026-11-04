import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Route guard component that restricts route access based on authentication status and user roles.
 * 
 * @param {Object} props
 * @param {Array<string>} [props.allowedRoles] - Optional list of permitted roles (e.g. ['ADMIN'])
 * @param {React.ReactNode} [props.children] - Optional child elements (renders <Outlet /> if omitted)
 */
export function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page while preserving the attempted URL in navigation state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is not allowed for this route, redirect to unauthorized warning page
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
