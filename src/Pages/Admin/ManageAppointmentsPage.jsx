import React, { useState, useEffect, useMemo, useCallback } from 'react';
import appointmentApi from '../../api/appointmentApi';
import { Badge, Button } from '../../Components/Common';
import { formatDateTime } from '../../utils/dateFormatter';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { Search, CheckCircle2, XCircle, RefreshCw, AlertCircle, Clock, User, Stethoscope, ClipboardList } from 'lucide-react';

export function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await appointmentApi.getAllAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load clinic appointments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleComplete = useCallback(async (app) => {
    // Backend validation guard: Cannot complete before scheduled date and time
    const appointmentTime = new Date(app.appointmentDateTime);
    if (appointmentTime > new Date()) {
      const proceed = window.confirm(
        'Notice: This appointment is scheduled for a future time. Backend business rules disallow completing visits before their scheduled time. Do you still wish to attempt?'
      );
      if (!proceed) return;
    }

    setActionLoadingId(app.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await appointmentApi.completeAppointment(app.id);
      setSuccessMessage(`Appointment #${app.id.slice(0, 8)} marked as COMPLETED.`);
      fetchAppointments();
    } catch (err) {
      setErrorMessage(err.message || 'Could not complete appointment.');
    } finally {
      setActionLoadingId(null);
    }
  }, [fetchAppointments]);

  const handleCancel = useCallback(async (app) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel the appointment between ${app.patientName} and ${app.doctorName}?`
    );
    if (!confirmCancel) return;

    setActionLoadingId(app.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await appointmentApi.cancelAppointment(app.id);
      setSuccessMessage(`Appointment #${app.id.slice(0, 8)} was CANCELLED.`);
      fetchAppointments();
    } catch (err) {
      setErrorMessage(err.message || 'Could not cancel appointment.');
    } finally {
      setActionLoadingId(null);
    }
  }, [fetchAppointments]);

  // Memoize status counts in a single O(n) pass
  const statusCounts = useMemo(() => {
    const counts = { ALL: appointments.length, SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 };
    for (const app of appointments) {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    }
    return counts;
  }, [appointments]);

  // Memoize filtered appointments list
  const filteredAppointments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return appointments.filter((app) => {
      if (activeTab !== 'ALL' && app.status !== activeTab) {
        return false;
      }
      if (!query) return true;
      return (
        app.patientName?.toLowerCase().includes(query) ||
        app.doctorName?.toLowerCase().includes(query) ||
        app.reason?.toLowerCase().includes(query)
      );
    });
  }, [appointments, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Appointments Oversight</h1>
          <p className="text-xs text-slate-500 mt-1">
            Clinic-wide appointment tracking, state overrides, and scheduling governance
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAppointments}
          icon={RefreshCw}
          disabled={isLoading}
        >
          Refresh All
        </Button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between animate-fade-in">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-800 font-bold ml-2">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-800 font-bold ml-2">×</button>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient, doctor, or symptom reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['ALL', APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {tab === 'ALL' ? 'All Clinic Records' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-black/10">
              {statusCounts[tab] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-10 bg-slate-100 rounded" />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Scheduled Time</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((app) => {
                  const isScheduled = app.status === APPOINTMENT_STATUS.SCHEDULED;
                  const isProcessing = actionLoadingId === app.id;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{app.patientName}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                          <Stethoscope className="w-4 h-4 text-purple-500 shrink-0" />
                          <span>{app.doctorName}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                          <span className="text-slate-400 text-[11px] italic">Resolved</span>
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

export default ManageAppointmentsPage;
