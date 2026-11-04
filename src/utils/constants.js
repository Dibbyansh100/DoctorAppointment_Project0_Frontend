export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

export const STORAGE_KEYS = {
  TOKEN: 'doctor_sys_token',
  USER: 'doctor_sys_user',
};

// When VITE_API_BASE_URL is empty, Axios makes requests relative to the current host,
// allowing Vite's dev proxy (in vite.config.js) to forward calls to http://localhost:8079 without CORS issues.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
