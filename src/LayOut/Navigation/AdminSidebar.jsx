import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Users, CalendarCheck, ShieldCheck } from 'lucide-react';

export function AdminSidebar() {
  const links = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
    { to: '/admin/patients', label: 'Manage Patients', icon: Users },
    { to: '/admin/appointments', label: 'All Appointments', icon: CalendarCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Administration
        </div>
        <nav className="mt-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100/60 text-xs text-purple-900 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Clinic Oversight</p>
          <p className="text-[11px] text-purple-700 mt-0.5">Admin privilege: full doctor, patient, and appointment management.</p>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
