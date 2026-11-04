import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../Components/Common';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function UnauthorizedPage() {
  const { userRole } = useAuth();

  const getDashboardPath = () => {
    if (userRole === 'ADMIN') return '/admin/dashboard';
    if (userRole === 'DOCTOR') return '/doctor/dashboard';
    if (userRole === 'PATIENT') return '/patient/dashboard';
    return '/login';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8 text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">403 - Access Denied</h1>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          You do not have the required role privileges to access this page. Your active role is{' '}
          <span className="font-semibold text-slate-800 uppercase">{userRole || 'Guest'}</span>.
        </p>

        <div className="mt-6 flex justify-center">
          <Link to={getDashboardPath()}>
            <Button variant="primary" icon={ArrowLeft}>
              Back to My Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
