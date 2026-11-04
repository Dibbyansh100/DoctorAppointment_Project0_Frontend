import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import doctorApi from '../../api/doctorApi';
import appointmentApi from '../../api/appointmentApi';
import { Badge, Button } from '../../Components/Common';
import { formatDateTime } from '../../utils/dateFormatter';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { ClipboardList, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, User, Calendar } from 'lucide-react';

export function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState(() => localStorage.getItem('doctor_sys_doctor_id') || '');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Automatically resolve doctorId by matching doctor record email to logged-in user email
  useEffect(() => {
    async function resolveDoctor() {
      try {
        const doctors = await doctorApi.getDoctors();
        const matched = doctors.find((d) => d.email.toLowerCase() === user?.email.toLowerCase());
        if (matched) {
          setDoctorId(matched.id);
          localStorage.setItem('doctor_sys_doctor_id', matched.id);
        } else if (!doctorId && user?.id) {
          setDoctorId(user.id);
        }
      } catch (err) {
        // Fallback to user.id if public doctor query fails
        if (!doctorId && user?.id) setDoctorId(user.id);
      }
    }
    if (!doctorId) {
      resolveDoctor();
    }
  }, [user, doctorId]);

  const fetchAppointments = async () => {
    if (!doctorId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await appointmentApi.getAppointmentsByDoctor(doctorId);
      setAppointments(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load doctor appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchAppointments();
    }
  }, [doctorId]);

  // Handle Mark Complete: PATCH /api/v1/appointments/{id}/complete
  const handleComplete = async (app) => {
    // Backend validation: Cannot complete before scheduled date and time
    const appointmentTime = new Date(app.appointmentDateTime);
    if (appointmentTime > new Date()) {
      if (
        !window.confirm(
          'Notice: This appointment is scheduled for a future time. Backend business rules disallow completing visits before their scheduled time. Do you still wish to attempt?'
        )
      ) {
        return;
      }
    }

    setActionLoadingId(app.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await appointmentApi.completeAppointment(app.id);
      setSuccessMessage(`Appointment with ${app.patientName} marked as COMPLETED.`);
      fetchAppointments();
    } catch (err) {
      setErrorMessage(err.message || 'Could not complete appointment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Cancel: PATCH /api/v1/appointments/{id}/cancel
  const handleCancel = async (app) => {
    if (!window.confirm(`Are you sure you want to cancel the appointment with ${app.patientName}?`)) {
      return;
    }

    setActionLoadingId(app.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await appointmentApi.cancelAppointment(app.id);
      setSuccessMessage(`Appointment with ${app.patientName} was CANCELLED.`);
      fetchAppointments();
    } catch (err) {
      setErrorMessage(err.message || 'Could not cancel appointment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (activeTab === 'ALL') return true;
    return app.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doctor Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your patient consultation queue, complete visits, and review scheduled bookings
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAppointments}
          icon={RefreshCw}
          disabled={isLoading}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-800 font-bold">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Operation Alert</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-800 font-bold">×</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['ALL', APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {tab === 'ALL' ? 'All Queue' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
              {tab === 'ALL'
                ? appointments.length
                : appointments.filter((a) => a.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments List / Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-10 bg-slate-100 rounded"></div>
          <div className="h-10 bg-slate-100 rounded"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No appointments in this view</h3>
          <p className="text-xs text-slate-500 mt-1">There are currently no patients in this queue status.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Patient Name</th>
                  <th className="px-5 py-3.5">Appointment Time</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((app) => {
                  const isScheduled = app.status === APPOINTMENT_STATUS.SCHEDULED;
                  const isProcessing = actionLoadingId === app.id;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p>{app.patientName}</p>
                            <span className="text-[10px] text-slate-600 font-mono">ID: {app.patientId.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateTime(app.appointmentDateTime)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-xs truncate" title={app.reason}>
                        {app.reason}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge status={app.status} />
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        {isScheduled ? (
                          <div className="inline-flex items-center gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleComplete(app)}
                              isLoading={isProcessing}
                              icon={CheckCircle2}
                            >
                              Complete
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancel(app)}
                              isLoading={isProcessing}
                              icon={XCircle}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;
