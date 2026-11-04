import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '../Common';
import { Mail, Phone, DollarSign } from 'lucide-react';

/**
 * Pure presentational card representing a physician specialist.
 * Memoized to avoid re-renders when the parent list filters or paginates.
 */
export const DoctorCard = memo(function DoctorCard({
  doctor,
  isAuthenticated,
  isPatient,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Physician Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
              {doctor.name?.charAt(0) || 'D'}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{doctor.name}</h3>
              <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px] mt-0.5">
                {doctor.specialization}
              </span>
            </div>
          </div>
          <Badge status={doctor.active ? 'ACTIVE' : 'INACTIVE'} />
        </div>

        {/* Contact & Fee Details */}
        <div className="space-y-2 text-xs text-slate-600 py-3 border-y border-slate-100">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{doctor.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{doctor.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Consultation Fee: ${Number(doctor.consultationFee).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-1">
        {isAuthenticated && isPatient ? (
          <Link to={`/patient/book-appointment?doctorId=${doctor.id}`}>
            <Button variant="primary" className="w-full">
              Book Appointment
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Sign in to Book
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
});

export default DoctorCard;
