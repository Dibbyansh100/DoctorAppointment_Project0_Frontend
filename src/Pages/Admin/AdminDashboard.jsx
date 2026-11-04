import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import doctorApi from '../../api/doctorApi';
import patientApi from '../../api/patientApi';
import appointmentApi from '../../api/appointmentApi';
import { StatCard, Badge, Button } from '../../Components/Common';
import { formatDateTime } from '../../utils/dateFormatter';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { Shield, Stethoscope, Users, CalendarCheck, Plus, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      setIsLoading(true);
      try {
        const [docsRes, patsRes, appsRes] = await Promise.allSettled([
          doctorApi.getDoctors(),
          patientApi.getAllPatients(),
          appointmentApi.getAllAppointments(),
        ]);

        if (docsRes.status === 'fulfilled') setDoctors(docsRes.value);
        if (patsRes.status === 'fulfilled') setPatients(patsRes.value);
        if (appsRes.status === 'fulfilled') setAppointments(appsRes.value);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const activeDoctors = doctors.filter((d) => d.active).length;
  const activePatients = patients.filter((p) => p.active).length;
  const scheduledApps = appointments.filter((a) => a.status === APPOINTMENT_STATUS.SCHEDULED).length;
  const completedApps = appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length;

  return (
    <div className="space-y-8">
      {/* Admin Hero Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-300" />
            <span>Clinic Administrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Control Center
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
            Logged in as <strong className="text-white">{user?.email}</strong>. Comprehensive oversight across clinical staff, patients, and scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/admin/doctors">
            <Button variant="secondary" size="sm" icon={Plus}>
              Manage Doctors
            </Button>
          </Link>
          <Link to="/admin/patients">
            <Button variant="outline" size="sm" icon={Plus} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Manage Patients
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Clinical Doctors"
          value={doctors.length}
          subtitle={`${activeDoctors} Active in Practice`}
          icon={Stethoscope}
          color="indigo"
          loading={isLoading}
        />

        <StatCard
          title="Registered Patients"
          value={patients.length}
          subtitle={`${activePatients} Active Records`}
          icon={Users}
          color="blue"
          loading={isLoading}
        />

        <StatCard
          title="Scheduled Visits"
          value={scheduledApps}
          subtitle="Awaiting Consultation"
          icon={Clock}
          color="amber"
          loading={isLoading}
        />

        <StatCard
          title="Completed Visits"
          value={completedApps}
          subtitle="Fulfilled Consultations"
          icon={CheckCircle2}
          color="emerald"
          loading={isLoading}
        />
      </div>

      {/* Quick Access Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Doctor Directory</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add new physicians, modify consultation fees, and toggle active practice permissions.
            </p>
          </div>
          <Link to="/admin/doctors" className="mt-5">
            <Button variant="outline" size="sm" className="w-full" icon={ArrowRight}>
              Open Doctors Panel
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Patient Registry</h3>
            <p className="text-xs text-slate-500 mt-1">
              Onboard patient profiles, view patient contact details, and copy patient UUIDs for bookings.
            </p>
          </div>
          <Link to="/admin/patients" className="mt-5">
            <Button variant="outline" size="sm" className="w-full" icon={ArrowRight}>
              Open Patients Panel
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Master Appointments</h3>
            <p className="text-xs text-slate-500 mt-1">
              Real-time oversight of all scheduled, completed, and cancelled clinic appointments.
            </p>
          </div>
          <Link to="/admin/appointments" className="mt-5">
            <Button variant="outline" size="sm" className="w-full" icon={ArrowRight}>
              Open Appointments Panel
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Appointments Audit */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Appointments Audit</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live feed of clinic appointments across all medical departments</p>
          </div>

          <Link
            to="/admin/appointments"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>View All ({appointments.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <p className="text-xs text-slate-600 py-6 text-center">No appointments registered in the system yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.slice(0, 5).map((app) => (
              <div key={app.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    {app.patientName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {app.patientName} <span className="font-normal text-slate-500">with</span> {app.doctorName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-sm">Reason: {app.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[11px] text-slate-600 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
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

export default AdminDashboard;
