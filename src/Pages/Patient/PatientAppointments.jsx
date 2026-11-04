import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import appointmentApi from '../../api/appointmentApi';
import { Button } from '../../Components/Common';
import { AppointmentCard } from '../../Components/Appointments';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';

export function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  
  // Patient ID resolver
  const [patientId, setPatientId] = useState(() => {
    return localStorage.getItem('doctor_sys_patient_id') || user?.id || '';
  });

  const fetchAppointments = async () => {
    if (!patientId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await appointmentApi.getAppointmentsByPatient(patientId);
      setAppointments(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch appointments. Ensure a valid Patient profile exists.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const handleCancelClick = useCallback(async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled appointment?')) {
      return;
    }
    setCancellingId(appointmentId);
    try {
      await appointmentApi.cancelAppointment(appointmentId);
      setActionMessage('Appointment successfully cancelled.');
      fetchAppointments();
    } catch (err) {
      setErrorMessage(err.message || 'Unable to cancel appointment. Please try again.');
    } finally {
      setCancellingId(null);
    }
  }, [fetchAppointments]);

  // Filter based on active tab
  const filteredAppointments = appointments.filter((app) => {
    if (activeTab === 'ALL') return true;
    return app.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your upcoming consultations and medical appointment history
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAppointments}
            icon={RefreshCw}
            disabled={isLoading}
          >
            Refresh
          </Button>

          <Link to="/patient/book-appointment">
            <Button variant="primary" size="sm" icon={Plus}>
              Book New Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-emerald-800 font-bold">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-800 font-bold">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['ALL', APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {tab === 'ALL' ? 'All Appointments' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
              {tab === 'ALL'
                ? appointments.length
                : appointments.filter((a) => a.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'ALL'
              ? "You haven't scheduled any doctor consultations yet."
              : `You don't have any appointments with status ${activeTab}.`}
          </p>
          <div className="mt-4">
            <Link to="/patient/book-appointment">
              <Button variant="primary" size="sm" icon={Plus}>
                Book Your First Visit
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredAppointments.map((app) => (
            <AppointmentCard
              key={app.id}
              appointment={app}
              onCancel={handleCancelClick}
              isCancelling={cancellingId === app.id}
              showDoctorName={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientAppointments;
