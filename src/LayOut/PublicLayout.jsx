import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, Stethoscope, ArrowRight } from 'lucide-react';

export function PublicLayout() {
  const { isAuthenticated, userRole } = useAuth();

  const getDashboardLink = () => {
    if (userRole === 'ADMIN') return '/admin/dashboard';
    if (userRole === 'DOCTOR') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-800 tracking-tight">CareClinic</span>
              <span className="text-xs block text-slate-600 font-medium -mt-1">Healthcare Portal</span>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link to="/doctors" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              Find Doctors
            </Link>

            <div className="flex items-center gap-2.5 ml-2">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} CareClinic Appointment System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Spring Boot REST API</span>
            <span>•</span>
            <span>PostgreSQL</span>
            <span>•</span>
            <span>OAuth2 JWT Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
