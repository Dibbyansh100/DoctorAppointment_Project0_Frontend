import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { STORAGE_KEYS, USER_ROLES } from '../utils/constants';
import authApi from '../api/authApi';

export const AuthContext = createContext(null);

/**
 * Checks if a JWT token string has expired.
 * Does not require external libraries: decodes the base64 payload.
 */
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    const decodedJson = JSON.parse(atob(payloadBase64));
    if (!decodedJson.exp) return false;
    return decodedJson.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * Clears all authentication-related keys from localStorage
 */
export function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.DOCTOR_ID);
  localStorage.removeItem(STORAGE_KEYS.PATIENT_ID);
}

export function AuthProvider({ children }) {
  // Initialize state with validation against expired tokens
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!savedToken || isTokenExpired(savedToken)) {
      clearAuthStorage();
      return null;
    }
    return savedToken;
  });

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!savedToken || isTokenExpired(savedToken)) {
      return null;
    }
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      clearAuthStorage();
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Synchronize state when 401 is dispatched by axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthStorage();
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  /**
   * Logs in with email & password and stores credentials
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
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
   * Logs out user and cleans up all cached entity IDs
   */
  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Allows components to update the active user profile in state and localStorage
   */
  const updateUserProfile = useCallback((partialUser) => {
    setUser((prev) => {
      const updated = { ...prev, ...partialUser };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isAuthenticated = useMemo(() => Boolean(token && user && !isTokenExpired(token)), [token, user]);
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
      updateUserProfile,
    }),
    [token, user, loading, isAuthenticated, userRole, login, register, logout, updateUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
