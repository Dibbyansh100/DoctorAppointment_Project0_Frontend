import React, { memo } from 'react';
import { Badge } from '../Common/Badge';
import { formatDateTime } from '../../utils/dateFormatter';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { Stethoscope, Clock, XCircle } from 'lucide-react';

/**
 * Pure presentational card representing a medical appointment.
 * Memoized to prevent re-renders when parent lists filter or toggle tabs.
 */
export const AppointmentCard = memo(function AppointmentCard({
  appointment,
  onCancel,
  isCancelling = false,
  showDoctorName = true,
  showPatientName = false,
}) {
  const isScheduled = appointment.status === APPOINTMENT_STATUS.SCHEDULED;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Header: Title & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {showDoctorName && (appointment.doctorName || 'Doctor Consultation')}
                {showPatientName && (appointment.patientName || 'Patient Consultation')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {showDoctorName ? 'Doctor Consultation' : 'Patient Visit'}
              </p>
            </div>
          </div>
          <Badge status={appointment.status} />
        </div>

        {/* Details: Date/Time and Reason */}
        <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">
              {formatDateTime(appointment.appointmentDateTime)}
            </span>
          </div>
          {appointment.reason && (
            <div className="flex items-start gap-2">
              <span className="font-semibold text-slate-500 shrink-0">Reason:</span>
              <span className="text-slate-700 line-clamp-2">{appointment.reason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Booking Timestamp & Actions */}
      <div className="mt-4 pt-1 flex items-center justify-between text-[11px] text-slate-600">
        <span>Booked: {formatDateTime(appointment.createdAt)}</span>

        {isScheduled && onCancel && (
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => onCancel(appointment.id)}
            className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            {isCancelling ? 'Cancelling...' : 'Cancel Visit'}
          </button>
        )}
      </div>
    </div>
  );
});

export default AppointmentCard;
