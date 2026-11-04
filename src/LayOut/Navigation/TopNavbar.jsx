import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../Components/Common';
import { LogOut, User, Activity } from 'lucide-react';

/**
 * Top Navbar rendered at the top of all authenticated dashboards.
 * Displays clinic branding, user email, role badge, and a Logout button.
 */
export function TopNavbar() {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-800 tracking-tight">CareClinic</span>
            <span className="text-xs block text-slate-600 font-medium -mt-1">Appointment Portal</span>
          </div>
        </Link>

        {/* User info & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 rounded-full py-1.5 px-3">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.email}</p>
              <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">{userRole}</span>
            </div>
            <Badge status={userRole} label={userRole} className="ml-1" />
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
