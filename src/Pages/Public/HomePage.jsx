import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../Components/Common';
import { Calendar, Stethoscope, Shield, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export function HomePage() {
  const { isAuthenticated, userRole } = useAuth();

  const getPrimaryAction = () => {
    if (!isAuthenticated) {
      return { to: '/register', label: 'Get Started - Sign Up' };
    }
    if (userRole === 'ADMIN') return { to: '/admin/dashboard', label: 'Admin Dashboard' };
    if (userRole === 'DOCTOR') return { to: '/doctor/dashboard', label: 'Doctor Workspace' };
    return { to: '/patient/book-appointment', label: 'Book an Appointment' };
  };

  const action = getPrimaryAction();

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            Healthcare Scheduling Made Effortless
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Schedule Clinic Appointments with <span className="text-indigo-600">Top Specialists</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A seamless medical appointment management system designed for patients, doctors, and clinic administrators. Real-time availability, conflict-free scheduling, and verified doctor directories.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={action.to}>
              <Button size="lg" variant="primary" icon={ArrowRight}>
                {action.label}
              </Button>
            </Link>

            <Link to="/doctors">
              <Button size="lg" variant="outline" icon={Stethoscope}>
                Browse Doctors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-800">Designed for Every Clinical Role</h2>
          <p className="text-xs text-slate-500 mt-1">Dedicated portals built specifically for your healthcare journey</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">For Patients</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Find qualified doctors, view consultation fees, pick open slots with automated schedule conflict detection, and track visit history.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">For Doctors</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Access your daily schedule agenda, manage active appointments, mark completed patient consultations, and handle cancellations smoothly.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">For Administrators</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Maintain clinic-wide doctors, onboard and activate patient records, and monitor appointments with full audit and status oversight.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
