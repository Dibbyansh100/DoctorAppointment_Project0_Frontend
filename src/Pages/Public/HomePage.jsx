import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../Components/Common';
import { Calendar, Stethoscope, Shield, ArrowRight } from 'lucide-react';
import clinicHero from '../../assets/clinic-hero.jpg';

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
      {/* Hero Section with Medical Clinic Background */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200/70">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center sm:bg-right-top bg-no-repeat"
          style={{ backgroundImage: `url(${clinicHero})` }}
        />

        {/* Refined Gradient Overlay: Provides crisp readability on left while highlighting clinic on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/30 sm:via-white/90 sm:to-transparent" />

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              Healthcare Scheduling Made Effortless
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Schedule Clinic Appointments with{' '}
              <span className="text-indigo-600">Top Specialists</span>
            </h1>

            <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-medium">
              A seamless medical appointment management system designed for patients, doctors, and clinic administrators. Real-time availability, conflict-free scheduling, and verified doctor directories.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={action.to}>
                <Button size="lg" variant="primary" icon={ArrowRight} className="shadow-md shadow-indigo-500/20">
                  {action.label}
                </Button>
              </Link>

              <Link to="/doctors">
                <Button size="lg" variant="outline" icon={Stethoscope} className="bg-white/80 backdrop-blur-xs">
                  Browse Doctors
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Strip */}
            <div className="mt-10 pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">100%</p>
                <p className="text-[11px] text-slate-500 font-medium">Verified Physicians</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-indigo-600">24/7</p>
                <p className="text-[11px] text-slate-500 font-medium">Slot Availability</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">Zero</p>
                <p className="text-[11px] text-slate-500 font-medium">Booking Conflicts</p>
              </div>
            </div>
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
