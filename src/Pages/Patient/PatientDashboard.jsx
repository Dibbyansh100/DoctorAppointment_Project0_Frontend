import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import appointmentApi from '../../api/appointmentApi';
import { StatCard, Badge, Button } from '../../Components/Common';
import { formatDateTime } from '../../utils/dateFormatter';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { Calendar, CheckCircle2, Clock, XCircle, Plus, Stethoscope, ArrowRight } from 'lucide-react';

export function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const patientId = localStorage.getItem('doctor_sys_patient_id') || user?.id || '';

  useEffect(() => {
    async function loadData() {
      if (!patientId) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await appointmentApi.getAppointmentsByPatient(patientId);
        setAppointments(data);
      } catch (err) {
        // Patient entity may not exist in patients table yet
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  const scheduled = appointments.filter((a) => a.status === APPOINTMENT_STATUS.SCHEDULED);
  const completed = appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED);
  const cancelled = appointments.filter((a) => a.status === APPOINTMENT_STATUS.CANCELLED);

  // Next upcoming scheduled appointment
  const nextAppointment = scheduled.length > 0 ? scheduled[0] : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.email}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
            Manage your clinic appointments, view medical schedules, and consult with doctors seamlessly.
          </p>
        </div>

        <Link to="/patient/book-appointment" className="shrink-0">
          <Button variant="secondary" size="lg" icon={Plus}>
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Visits"
          value={appointments.length}
          icon={Calendar}
          color="indigo"
          loading={isLoading}
        />
        <StatCard
          title="Scheduled"
          value={scheduled.length}
          icon={Clock}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Completed"
          value={completed.length}
          icon={CheckCircle2}
          color="emerald"
          loading={isLoading}
        />
        <StatCard
          title="Cancelled"
          value={cancelled.length}
          icon={XCircle}
          color="rose"
          loading={isLoading}
        />
      </div>

      {/* Next Upcoming Appointment Highlight */}
      {nextAppointment && (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              Next Scheduled Appointment
            </h2>
            <Badge status={nextAppointment.status} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">{nextAppointment.doctorName}</h3>
                <p className="text-xs text-slate-500">Reason: {nextAppointment.reason}</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Appointment Time</p>
              <p className="text-sm font-bold text-blue-900">
                {formatDateTime(nextAppointment.appointmentDateTime)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Appointments Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Recent Appointments</h2>
          <Link
            to="/patient/appointments"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <p className="text-xs text-slate-600 py-4 text-center">No appointments registered yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.slice(0, 3).map((app) => (
              <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{app.doctorName}</h3>
                    <p className="text-[11px] text-slate-500">{formatDateTime(app.appointmentDateTime)}</p>
                  </div>
                </div>
                <Badge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;
