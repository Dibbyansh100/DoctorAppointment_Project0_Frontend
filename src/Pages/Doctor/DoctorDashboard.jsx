import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import doctorApi from '../../api/doctorApi';
import appointmentApi from '../../api/appointmentApi';
import { StatCard, Badge, Button } from '../../Components/Common';
import { formatTime, formatDateTime } from '../../utils/dateFormatter';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { Stethoscope, Calendar, Clock, CheckCircle2, XCircle, ArrowRight, DollarSign, Phone, Mail } from 'lucide-react';

export function DoctorDashboard() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState(() => localStorage.getItem('doctor_sys_doctor_id') || '');
  const [isLoading, setIsLoading] = useState(true);

  // Load Doctor Profile and ID
  useEffect(() => {
    async function loadDoctorInfo() {
      try {
        const doctors = await doctorApi.getDoctors();
        const matched = doctors.find((d) => d.email.toLowerCase() === user?.email.toLowerCase());
        if (matched) {
          setDoctorProfile(matched);
          setDoctorId(matched.id);
          localStorage.setItem('doctor_sys_doctor_id', matched.id);
        } else if (!doctorId && user?.id) {
          setDoctorId(user.id);
        }
      } catch (err) {
        if (!doctorId && user?.id) setDoctorId(user.id);
      }
    }
    loadDoctorInfo();
  }, [user, doctorId]);

  // Load Doctor Appointments
  useEffect(() => {
    async function loadAppointments() {
      if (!doctorId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await appointmentApi.getAppointmentsByDoctor(doctorId);
        setAppointments(data);
      } catch (err) {
        // Handled silently
      } finally {
        setIsLoading(false);
      }
    }
    if (doctorId) {
      loadAppointments();
    }
  }, [doctorId]);

  const scheduled = appointments.filter((a) => a.status === APPOINTMENT_STATUS.SCHEDULED);
  const completed = appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED);
  const cancelled = appointments.filter((a) => a.status === APPOINTMENT_STATUS.CANCELLED);

  return (
    <div className="space-y-8">
      {/* Doctor Profile Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl border border-white/20">
              <Stethoscope className="w-8 h-8 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
                  Doctor Workspace
                </span>
                {doctorProfile && <Badge status={doctorProfile.active ? 'ACTIVE' : 'INACTIVE'} />}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {doctorProfile ? doctorProfile.name : user?.email}
              </h1>
              <p className="text-xs text-blue-200 mt-0.5">
                Specialization: <strong className="text-white">{doctorProfile?.specialization || 'Clinical Practice'}</strong>
              </p>
            </div>
          </div>

          {doctorProfile && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-6 text-xs">
              <div>
                <p className="text-blue-200 text-[11px]">Fee</p>
                <p className="text-lg font-bold text-white flex items-center">
                  <DollarSign className="w-4 h-4 text-emerald-300" />
                  {Number(doctorProfile.consultationFee).toFixed(2)}
                </p>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div>
                <p className="text-blue-200 text-[11px]">Phone</p>
                <p className="font-semibold text-white">{doctorProfile.phoneNumber}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Consultations"
          value={appointments.length}
          icon={Calendar}
          color="indigo"
          loading={isLoading}
        />
        <StatCard
          title="Scheduled Queue"
          value={scheduled.length}
          icon={Clock}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Completed Visits"
          value={completed.length}
          icon={CheckCircle2}
          color="emerald"
          loading={isLoading}
        />
        <StatCard
          title="Cancelled Visits"
          value={cancelled.length}
          icon={XCircle}
          color="rose"
          loading={isLoading}
        />
      </div>

      {/* Upcoming Patients Queue Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Scheduled Patient Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">Patients waiting for clinical consultation</p>
          </div>
          <Link
            to="/doctor/appointments"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Manage All Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {scheduled.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-600">
            No scheduled patients in queue today.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {scheduled.slice(0, 4).map((app) => (
              <div key={app.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {app.patientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{app.patientName}</h4>
                    <p className="text-xs text-slate-500 truncate max-w-md">Reason: {app.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    {formatDateTime(app.appointmentDateTime)}
                  </span>
                  <Badge status={app.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
