import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import doctorApi from '../../api/doctorApi';
import appointmentApi from '../../api/appointmentApi';
import { Button, Input, Select } from '../../Components/Common';
import { getMinDateTimeString, formatDateTime } from '../../utils/dateFormatter';
import { Calendar, Clock, Stethoscope, AlertCircle, CheckCircle2, DollarSign, UserCheck, ArrowRight } from 'lucide-react';

export function BookAppointmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId);
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [reason, setReason] = useState('');
  
  // Patient ID resolver (checks localStorage or defaults to logged-in user.id)
  const [patientId, setPatientId] = useState(() => {
    return localStorage.getItem('doctor_sys_patient_id') || user?.id || '';
  });
  const [showPatientIdConfig, setShowPatientIdConfig] = useState(false);

  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Fetch active doctors for selection
  useEffect(() => {
    async function loadDoctors() {
      setIsLoadingDoctors(true);
      try {
        const data = await doctorApi.getDoctors();
        // Only active doctors can accept appointments according to backend business rules
        const activeDocs = data.filter((d) => d.active);
        setDoctors(activeDocs);
        if (preselectedDoctorId && activeDocs.some((d) => d.id === preselectedDoctorId)) {
          setSelectedDoctorId(preselectedDoctorId);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load doctors list.');
      } finally {
        setIsLoadingDoctors(false);
      }
    }
    loadDoctors();
  }, [preselectedDoctorId]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    if (!selectedDoctorId) {
      setFieldErrors((prev) => ({ ...prev, doctorId: 'Please select a doctor' }));
      return;
    }
    if (!appointmentDateTime) {
      setFieldErrors((prev) => ({ ...prev, appointmentDateTime: 'Please choose date and time' }));
      return;
    }
    if (!reason.trim()) {
      setFieldErrors((prev) => ({ ...prev, reason: 'Reason for appointment is required' }));
      return;
    }
    if (!patientId.trim()) {
      setErrorMessage('Patient ID is required. Please verify your Patient profile.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Payload format matches backend AppointmentRequest record:
      // { patientId: UUID, doctorId: UUID, appointmentDateTime: LocalDateTime, reason: string }
      const payload = {
        patientId: patientId.trim(),
        doctorId: selectedDoctorId,
        appointmentDateTime: appointmentDateTime, // standard YYYY-MM-DDTHH:mm
        reason: reason.trim(),
      };

      const response = await appointmentApi.bookAppointment(payload);
      setBookedAppointment(response);
      // Persist verified patientId in storage for future bookings
      localStorage.setItem('doctor_sys_patient_id', patientId.trim());
    } catch (err) {
      setErrorMessage(err.message || 'Could not complete booking.');
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookedAppointment) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Appointment Confirmed!</h2>
        <p className="text-xs text-slate-500 mt-1">
          Your appointment has been registered with status <span className="font-semibold text-blue-600">SCHEDULED</span>
        </p>

        <div className="mt-6 bg-slate-50 rounded-xl p-5 border border-slate-200/80 text-left space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Doctor:</span>
            <span className="font-semibold text-slate-800">{bookedAppointment.doctorName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Date & Time:</span>
            <span className="font-semibold text-slate-800">{formatDateTime(bookedAppointment.appointmentDateTime)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Reason:</span>
            <span className="font-semibold text-slate-800">{bookedAppointment.reason}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Appointment ID:</span>
            <span className="font-mono text-[11px] text-slate-700">{bookedAppointment.id}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/patient/appointments">
            <Button variant="primary" icon={ArrowRight}>
              View My Appointments
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              setBookedAppointment(null);
              setSelectedDoctorId('');
              setAppointmentDateTime('');
              setReason('');
            }}
          >
            Book Another Appointment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Book an Appointment</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select an active physician, choose an open date/time, and detail your symptoms
        </p>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Booking Conflict or Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Booking Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Doctor <span className="text-rose-500">*</span>
            </label>

            {isLoadingDoctors ? (
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
            ) : (
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm bg-white outline-none transition-colors ${
                  fieldErrors.doctorId
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-slate-300 focus:border-indigo-500'
                }`}
              >
                <option value="">-- Choose an available specialist --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialization} (${Number(doc.consultationFee).toFixed(2)})
                  </option>
                ))}
              </select>
            )}

            {fieldErrors.doctorId && (
              <p className="text-xs text-rose-600 mt-1.5 font-medium">{fieldErrors.doctorId}</p>
            )}

            {/* Doctor preview card */}
            {selectedDoctor && (
              <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{selectedDoctor.name}</p>
                    <p className="text-indigo-700 font-medium">{selectedDoctor.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[11px]">Fee</p>
                  <p className="font-bold text-slate-800 text-sm">
                    ${Number(selectedDoctor.consultationFee).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Appointment Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Date & Time <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                min={getMinDateTimeString()}
                value={appointmentDateTime}
                onChange={(e) => setAppointmentDateTime(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-colors ${
                  fieldErrors.appointmentDateTime
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-300 focus:border-indigo-500 bg-white'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Backend validates that appointments cannot be booked in the past or collide with an existing booking.
            </p>
            {fieldErrors.appointmentDateTime && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.appointmentDateTime}</p>
            )}
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Reason for Visit (max 500 characters) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Describe your health concern, symptoms, or purpose of consultation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full p-3 rounded-xl border text-sm outline-none transition-colors ${
                fieldErrors.reason
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'border-slate-300 focus:border-indigo-500 bg-white'
              }`}
            />
            <div className="flex justify-between items-center text-[11px] text-slate-600 mt-1">
              <span>Required by clinic records</span>
              <span>{reason.length}/500</span>
            </div>
            {fieldErrors.reason && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.reason}</p>
            )}
          </div>

          {/* Patient UUID Profile Linkage */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-slate-400" />
                Booking for: <strong className="text-slate-800">{user?.email}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowPatientIdConfig(!showPatientIdConfig)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
              >
                {showPatientIdConfig ? 'Hide Profile ID' : 'Edit Profile ID'}
              </button>
            </div>

            {showPatientIdConfig && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <Input
                  label="Patient Entity UUID"
                  id="patientId"
                  name="patientId"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Paste Patient record UUID"
                  helperText="Spring Boot matches this UUID to the patients table (created by Admin or database seed)."
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            Confirm & Schedule Appointment
          </Button>
        </form>
      </div>
    </div>
  );
}

export default BookAppointmentPage;
