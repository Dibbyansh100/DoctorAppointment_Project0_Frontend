import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import doctorApi from '../api/doctorApi';
import { STORAGE_KEYS } from '../utils/constants';

// In-memory module cache so navigating between Doctor pages doesn't re-fetch GET /api/v1/doctors
let cachedDoctorProfile = null;
let cachedEmail = null;

/**
 * Custom hook to resolve the active Doctor entity profile and UUID.
 * Matches the logged-in User's email to the Doctor record in the clinic database.
 * 
 * @returns {{
 *   doctorId: string,
 *   doctorProfile: Object|null,
 *   isLoadingDoctor: boolean,
 *   doctorError: string,
 *   refreshDoctor: Function
 * }}
 */
export function useDoctorProfile() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(() => {
    if (cachedDoctorProfile && cachedEmail === user?.email?.toLowerCase()) {
      return cachedDoctorProfile;
    }
    return null;
  });
  
  const [doctorId, setDoctorId] = useState(() => {
    if (cachedDoctorProfile && cachedEmail === user?.email?.toLowerCase()) {
      return cachedDoctorProfile.id;
    }
    return localStorage.getItem(STORAGE_KEYS.DOCTOR_ID) || '';
  });

  const [isLoadingDoctor, setIsLoadingDoctor] = useState(!doctorId);
  const [doctorError, setDoctorError] = useState('');

  const resolveDoctor = useCallback(async (forceRefresh = false) => {
    if (!user?.email) {
      setIsLoadingDoctor(false);
      return;
    }

    const normalizedUserEmail = user.email.toLowerCase();

    // Use cached profile if already loaded for this user and not forcing refresh
    if (!forceRefresh && cachedDoctorProfile && cachedEmail === normalizedUserEmail) {
      setDoctorProfile(cachedDoctorProfile);
      setDoctorId(cachedDoctorProfile.id);
      setIsLoadingDoctor(false);
      return;
    }

    setIsLoadingDoctor(true);
    setDoctorError('');
    try {
      const doctors = await doctorApi.getDoctors();
      const matched = Array.isArray(doctors)
        ? doctors.find((d) => d.email.toLowerCase() === normalizedUserEmail)
        : null;

      if (matched) {
        cachedDoctorProfile = matched;
        cachedEmail = normalizedUserEmail;
        setDoctorProfile(matched);
        setDoctorId(matched.id);
        localStorage.setItem(STORAGE_KEYS.DOCTOR_ID, matched.id);
      } else {
        // Fallback: If no Doctor entity matches email, use user.id
        const fallbackId = user.id || '';
        setDoctorId(fallbackId);
        if (fallbackId) {
          localStorage.setItem(STORAGE_KEYS.DOCTOR_ID, fallbackId);
        }
      }
    } catch (err) {
      setDoctorError(err.message || 'Failed to resolve doctor profile.');
      if (user?.id) {
        setDoctorId(user.id);
      }
    } finally {
      setIsLoadingDoctor(false);
    }
  }, [user]);

  useEffect(() => {
    resolveDoctor();
  }, [resolveDoctor]);

  return {
    doctorId,
    doctorProfile,
    isLoadingDoctor,
    doctorError,
    refreshDoctor: () => resolveDoctor(true),
  };
}

export default useDoctorProfile;
