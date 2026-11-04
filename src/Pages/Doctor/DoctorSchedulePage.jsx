import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import doctorApi from '../../api/doctorApi';
import appointmentApi from '../../api/appointmentApi';
import { Badge, Button } from '../../Components/Common';
import { formatTime, formatDate, formatDateTime } from '../../utils/dateFormatter';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { Calendar, Clock, User, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export function DoctorSchedulePage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState(() => localStorage.getItem('doctor_sys_doctor_id') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Resolve Doctor ID
  useEffect(() => {
    async function resolveDoctor() {
      try {
        const doctors = await doctorApi.getDoctors();
        const matched = Array.isArray(doctors)
          ? doctors.find((d) => d.email.toLowerCase() === user?.email.toLowerCase())
          : null;
        if (matched) {
          setDoctorId(matched.id);
          localStorage.setItem('doctor_sys_doctor_id', matched.id);
        } else if (user?.id) {
          setDoctorId(user.id);
        }
      } catch (err) {
        if (user?.id) setDoctorId(user.id);
      }
    }
    if (user?.email) {
      resolveDoctor();
    }
  }, [user]);

  const loadSchedule = async () => {
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
      setErrorMessage(err.message || 'Failed to load schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      loadSchedule();
    }
  }, [doctorId]);

  // Group appointments by date
  const groupedSchedule = appointments.reduce((groups, app) => {
    const dateKey = formatDate(app.appointmentDateTime);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(app);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Clinical Schedule</h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological timeline of consultations and scheduled patient slots
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadSchedule}
          icon={RefreshCw}
          disabled={isLoading}
        >
          Refresh Schedule
        </Button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Schedule Agenda */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-24 bg-slate-100 rounded"></div>
        </div>
      ) : Object.keys(groupedSchedule).length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No appointments scheduled</h3>
          <p className="text-xs text-slate-500 mt-1">Your clinical schedule is currently open.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSchedule).map(([date, items]) => (
            <div key={date} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Date Header */}
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {date}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {items.length} {items.length === 1 ? 'Patient' : 'Patients'}
                </span>
              </div>

              {/* Timeline slots */}
              <div className="divide-y divide-slate-100 p-2 sm:p-4">
                {items.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/70 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Time pill */}
                      <div className="bg-blue-50 text-blue-800 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{formatTime(slot.appointmentDateTime)}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {slot.patientName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <strong className="text-slate-600">Reason:</strong> {slot.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Badge status={slot.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorSchedulePage;
