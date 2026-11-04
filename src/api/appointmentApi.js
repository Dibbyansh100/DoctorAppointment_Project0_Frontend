import axiosClient from './axiosClient';

/**
 * Appointment API Service
 * Interacts with Spring Boot AppointmentController at /api/v1/appointments
 */
export const appointmentApi = {
  /**
   * Books a new appointment.
   * Requires PATIENT or ADMIN role.
   * @param {Object} data - { patientId, doctorId, appointmentDateTime, reason }
   * @returns {Promise<{ id: string, patientId: string, patientName: string, doctorId: string, doctorName: string, appointmentDateTime: string, reason: string, status: string, createdAt: string }>}
   */
  bookAppointment: async (data) => {
    return axiosClient.post('/api/v1/appointments', data);
  },

  /**
   * Retrieves all appointments across the entire clinic.
   * Accessible by ADMIN, DOCTOR, PATIENT.
   */
  getAllAppointments: async () => {
    return axiosClient.get('/api/v1/appointments');
  },

  /**
   * Retrieves a single appointment by its UUID.
   * @param {string} id - Appointment UUID
   */
  getAppointmentById: async (id) => {
    return axiosClient.get(`/api/v1/appointments/${id}`);
  },

  /**
   * Retrieves all appointments for a specific patient.
   * @param {string} patientId - Patient UUID
   */
  getAppointmentsByPatient: async (patientId) => {
    return axiosClient.get(`/api/v1/appointments/patient/${patientId}`);
  },

  /**
   * Retrieves all appointments for a specific doctor.
   * @param {string} doctorId - Doctor UUID
   */
  getAppointmentsByDoctor: async (doctorId) => {
    return axiosClient.get(`/api/v1/appointments/doctor/${doctorId}`);
  },

  /**
   * Cancels an existing appointment.
   * @param {string} id - Appointment UUID
   */
  cancelAppointment: async (id) => {
    return axiosClient.patch(`/api/v1/appointments/${id}/cancel`);
  },

  /**
   * Marks an appointment as completed.
   * Requires DOCTOR or ADMIN role.
   * Cannot be completed before scheduled date/time.
   * @param {string} id - Appointment UUID
   */
  completeAppointment: async (id) => {
    return axiosClient.patch(`/api/v1/appointments/${id}/complete`);
  },
};

export default appointmentApi;
