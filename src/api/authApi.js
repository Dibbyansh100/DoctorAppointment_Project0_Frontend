import axiosClient from './axiosClient';

/**
 * Authentication API Service
 * Interacts with Spring Boot AuthController at /api/v1/auth
 */
export const authApi = {
  /**
   * Logs in an existing user (Patient, Doctor, or Admin).
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{ accessToken: string, tokenType: string, expiresIn: number, user: { id: string, email: string, userRole: string, active: boolean } }>}
   */
  login: async (credentials) => {
    return axiosClient.post('/api/v1/auth/login', {
      email: credentials.email.trim(),
      password: credentials.password,
    });
  },

  /**
   * Registers a new patient user account.
   * @param {Object} userData - { email, password }
   * @returns {Promise<{ id: string, email: string, userRole: string, active: boolean }>}
   */
  register: async (userData) => {
    return axiosClient.post('/api/v1/auth/register', {
      email: userData.email.trim(),
      password: userData.password,
    });
  },
};

export default authApi;
