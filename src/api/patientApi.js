import axiosClient from './axiosClient';

/**
 * Patient API Service
 * Interacts with Spring Boot PatientController at /api/v1/patients
 * Requires ADMIN role under current backend SecurityConfig.
 */
export const patientApi = {
  /**
   * Retrieves all registered patients.
   * @returns {Promise<Array<{ id: string, name: string, email: string, phoneNumber: string, active: boolean }>>}
   */
  getAllPatients: async () => {
    return axiosClient.get('/api/v1/patients');
  },

  /**
   * Retrieves a single patient by UUID.
   * @param {string} id - Patient UUID
   */
  getPatientById: async (id) => {
    return axiosClient.get(`/api/v1/patients/${id}`);
  },

  /**
   * Creates a new patient profile.
   * @param {Object} patientData - { name, email, phoneNumber }
   */
  createPatient: async (patientData) => {
    return axiosClient.post('/api/v1/patients', patientData);
  },

  /**
   * Updates an existing patient profile.
   * @param {string} id - Patient UUID
   * @param {Object} patientData - { name, email, phoneNumber }
   */
  updatePatient: async (id, patientData) => {
    return axiosClient.put(`/api/v1/patients/${id}`, patientData);
  },

  /**
   * Deactivates a patient profile.
   * @param {string} id - Patient UUID
   */
  deactivatePatient: async (id) => {
    return axiosClient.patch(`/api/v1/patients/${id}/deactivate`);
  },

  /**
   * Activates a patient profile.
   * @param {string} id - Patient UUID
   */
  activatePatient: async (id) => {
    return axiosClient.patch(`/api/v1/patients/${id}/activate`);
  },
};

export default patientApi;
