import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, CalendarDays, Stethoscope } from 'lucide-react';

export function DoctorSidebar() {
  const links = [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments', icon: ClipboardList },
    { to: '/doctor/schedule', label: 'My Schedule', icon: CalendarDays },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Doctor Workspace
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
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
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

      <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/60 text-xs text-blue-900 flex items-start gap-2.5">
        <Stethoscope className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Doctor Shift Active</p>
          <p className="text-[11px] text-blue-700 mt-0.5">Mark visits as completed when patient consultations conclude.</p>
        </div>
      </div>
    </aside>
  );
}

export default DoctorSidebar;
