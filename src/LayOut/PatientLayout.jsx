import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from './Navigation/TopNavbar';
import PatientSidebar from './Navigation/PatientSidebar';

/**
 * Shared layout wrapper for all Patient dashboard pages.
 */
export function PatientLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNavbar />
      <div className="flex flex-1">
        <PatientSidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PatientLayout;
