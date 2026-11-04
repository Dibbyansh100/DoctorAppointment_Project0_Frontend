import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/60 via-slate-50 to-blue-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">CareClinic</span>
        </Link>
        <p className="mt-2 text-xs text-slate-600 font-medium">
          Doctor Appointment Management System
        </p>
      </div>

      {/* Card container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-200/80 sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
