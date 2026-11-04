import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { STORAGE_KEYS, USER_ROLES } from '../utils/constants';
import authApi from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Listen to the 'auth:unauthorized' custom event dispatched by axiosClient interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  /**
   * Logs in with email and password
   * Returns the authenticated user record on success
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      // Response format: { accessToken, tokenType, expiresIn, user: { id, email, userRole, active } }
      const receivedToken = response.accessToken;
      const userProfile = response.user;

      localStorage.setItem(STORAGE_KEYS.TOKEN, receivedToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));

      setToken(receivedToken);
      setUser(userProfile);
      return userProfile;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registers a new patient account
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      return await authApi.register(userData);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logs out the current user and clears persisted session
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('doctor_sys_doctor_id');
    localStorage.removeItem('doctor_sys_patient_id');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);
  const userRole = useMemo(() => user?.userRole || null, [user]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated,
      userRole,
      isAdmin: userRole === USER_ROLES.ADMIN,
      isDoctor: userRole === USER_ROLES.DOCTOR,
      isPatient: userRole === USER_ROLES.PATIENT,
      login,
      register,
      logout,
    }),
    [token, user, loading, isAuthenticated, userRole, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
