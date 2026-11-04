import axiosClient from './axiosClient';

/**
 * Doctor API Service
 * Interacts with Spring Boot DoctorController at /api/v1/doctors
 */
export const doctorApi = {
  /**
   * Retrieves doctors list, optionally filtered by specialization.
   * Publicly accessible.
   * @param {string} [specialization] - Optional specialization filter
   * @returns {Promise<Array<{ id: string, name: string, email: string, phoneNumber: string, specialization: string, consultationFee: number, active: boolean }>>}
   */
  getDoctors: async (specialization) => {
    const params = {};
    if (specialization && specialization.trim()) {
      params.specialization = specialization.trim();
    }
    return axiosClient.get('/api/v1/doctors', { params });
  },

  /**
   * Retrieves a single doctor by UUID.
   * Publicly accessible.
   * @param {string} id - Doctor UUID
   */
  getDoctorById: async (id) => {
    return axiosClient.get(`/api/v1/doctors/${id}`);
  },

  /**
   * Registers a new doctor.
   * Requires ADMIN role.
   * @param {Object} doctorData - { name, email, phoneNumber, specialization, consultationFee }
   */
  createDoctor: async (doctorData) => {
    return axiosClient.post('/api/v1/doctors', doctorData);
  },

  /**
   * Updates existing doctor details.
   * Requires ADMIN role.
   * @param {string} id - Doctor UUID
   * @param {Object} doctorData - { name, email, phoneNumber, specialization, consultationFee }
   */
  updateDoctor: async (id, doctorData) => {
    return axiosClient.put(`/api/v1/doctors/${id}`, doctorData);
  },

  /**
   * Deactivates a doctor.
   * Requires ADMIN role.
   * @param {string} id - Doctor UUID
   */
  deactivateDoctor: async (id) => {
    return axiosClient.patch(`/api/v1/doctors/${id}/deactivate`);
  },

  /**
   * Activates a doctor.
   * Requires ADMIN role.
   * @param {string} id - Doctor UUID
   */
  activateDoctor: async (id) => {
    return axiosClient.patch(`/api/v1/doctors/${id}/activate`);
  },
};

export default doctorApi;
