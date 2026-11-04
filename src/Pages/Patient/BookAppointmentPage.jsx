import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import doctorApi from '../../api/doctorApi';
import appointmentApi from '../../api/appointmentApi';
import { Button, Input } from '../../Components/Common';
import { getMinDateTimeString, formatDateTime } from '../../utils/dateFormatter';
import { STORAGE_KEYS } from '../../utils/constants';
import { Stethoscope, AlertCircle, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';

const INITIAL_FORM_STATE = {
  doctorId: '',
  appointmentDateTime: '',
  reason: '',
};

export function BookAppointmentPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_STATE,
    doctorId: preselectedDoctorId,
  });

  // Patient ID resolver — uses STORAGE_KEYS.PATIENT_ID constant
  const [patientId, setPatientId] = useState(() => localStorage.getItem(STORAGE_KEYS.PATIENT_ID) || '');
  const [showPatientIdConfig, setShowPatientIdConfig] = useState(!patientId);

  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Fetch active doctors for selection
  useEffect(() => {
    let isMounted = true;
    async function loadDoctors() {
      setIsLoadingDoctors(true);
      try {
        const data = await doctorApi.getDoctors();
        if (!isMounted) return;

        // Only active doctors can accept appointments
        const activeDocs = Array.isArray(data) ? data.filter((d) => d.active) : [];
        setDoctors(activeDocs);

        if (activeDocs.length === 0) {
          setErrorMessage(
            'No doctors are currently available. An Admin must first create doctor records via Admin → Manage Doctors.'
          );
        }

        if (preselectedDoctorId && activeDocs.some((d) => d.id === preselectedDoctorId)) {
          setFormData((prev) => ({ ...prev, doctorId: preselectedDoctorId }));
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorMessage(err.message || 'Failed to load doctors list. Please verify the backend is running.');
      } finally {
        if (isMounted) setIsLoadingDoctors(false);
      }
    }

    loadDoctors();
    return () => {
      isMounted = false;
    };
  }, [preselectedDoctorId]);

  // Memoize selected doctor lookup to avoid array searches on every keystroke
  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === formData.doctorId) || null,
    [doctors, formData.doctorId]
  );

  // Unified change handler that automatically clears field-level validation errors
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (prev[name]) {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      }
      return prev;
    });
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const errors = {};
    if (!formData.doctorId) errors.doctorId = 'Please select a doctor';
    if (!formData.appointmentDateTime) errors.appointmentDateTime = 'Please choose date and time';
    if (!formData.reason.trim()) errors.reason = 'Reason for appointment is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!patientId.trim()) {
      setErrorMessage('Patient ID is required. Please save your Patient UUID below.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientId: patientId.trim(),
        doctorId: formData.doctorId,
        appointmentDateTime: formData.appointmentDateTime,
        reason: formData.reason.trim(),
      };

      const response = await appointmentApi.bookAppointment(payload);
      setBookedAppointment(response);
      localStorage.setItem(STORAGE_KEYS.PATIENT_ID, patientId.trim());
    } catch (err) {
      setErrorMessage(err.message || 'Could not complete booking.');
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnother = useCallback(() => {
    setBookedAppointment(null);
    setFormData(INITIAL_FORM_STATE);
  }, []);

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
          <Button variant="outline" onClick={handleBookAnother}>
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
            <label htmlFor="doctorId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Doctor <span className="text-rose-500">*</span>
            </label>

            {isLoadingDoctors ? (
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleInputChange}
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
              <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs animate-fade-in">
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
            <label htmlFor="appointmentDateTime" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              id="appointmentDateTime"
              name="appointmentDateTime"
              type="datetime-local"
              min={getMinDateTimeString()}
              value={formData.appointmentDateTime}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-xl border text-sm outline-none transition-colors ${
                fieldErrors.appointmentDateTime
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'border-slate-300 focus:border-indigo-500 bg-white'
              }`}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Backend validates that appointments cannot be booked in the past or collide with an existing booking.
            </p>
            {fieldErrors.appointmentDateTime && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.appointmentDateTime}</p>
            )}
          </div>

          {/* Reason for Visit */}
          <div>
            <label htmlFor="reason" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Reason for Visit (max 500 characters) <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              maxLength={500}
              placeholder="Describe your health concern, symptoms, or purpose of consultation..."
              value={formData.reason}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-xl border text-sm outline-none transition-colors ${
                fieldErrors.reason
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'border-slate-300 focus:border-indigo-500 bg-white'
              }`}
            />
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
              <span>Required by clinic records</span>
              <span>{formData.reason.length}/500</span>
            </div>
            {fieldErrors.reason && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.reason}</p>
            )}
          </div>

          {/* Patient UUID Profile Linkage */}
          <div className="pt-4 border-t border-slate-100">
            {!patientId ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800">Patient Profile Setup Required</p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Your login account does not have a linked Patient record. Ask your Admin to:
                    </p>
                    <ol className="text-xs text-amber-700 mt-2 list-decimal list-inside space-y-1">
                      <li>Go to <strong>Admin → Manage Patients → Add Patient</strong></li>
                      <li>Create a patient with email: <strong>{user?.email}</strong></li>
                      <li>Copy the <strong>Patient UUID</strong> and share it with you</li>
                    </ol>
                    <div className="mt-3">
                      <label htmlFor="patientUuidInput" className="block text-xs font-semibold text-amber-800 mb-1.5">
                        Paste your Patient UUID below:
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="patientUuidInput"
                          type="text"
                          value={patientId}
                          onChange={(e) => setPatientId(e.target.value)}
                          placeholder="e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                          className="flex-1 p-2.5 rounded-lg border border-amber-300 text-sm outline-none focus:border-indigo-500 bg-white font-mono text-xs"
                        />
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => {
                            if (patientId.trim()) {
                              localStorage.setItem(STORAGE_KEYS.PATIENT_ID, patientId.trim());
                              setShowPatientIdConfig(false);
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  Booking for: <strong className="text-slate-800">{user?.email}</strong>
                  <span className="text-[10px] text-slate-400 font-mono ml-1">({patientId.slice(0, 8)}…)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPatientIdConfig(!showPatientIdConfig)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                >
                  {showPatientIdConfig ? 'Hide' : 'Change ID'}
                </button>
              </div>
            )}

            {patientId && showPatientIdConfig && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label htmlFor="editPatientId" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Patient Entity UUID
                </label>
                <div className="flex gap-2">
                  <input
                    id="editPatientId"
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Paste Patient record UUID"
                    className="flex-1 p-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-indigo-500 bg-white font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      if (patientId.trim()) {
                        localStorage.setItem(STORAGE_KEYS.PATIENT_ID, patientId.trim());
                        setShowPatientIdConfig(false);
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">This UUID is from the patients table (created by Admin).</p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
            disabled={!patientId}
          >
            Confirm & Schedule Appointment
          </Button>
        </form>
      </div>
    </div>
  );
}

export default BookAppointmentPage;
