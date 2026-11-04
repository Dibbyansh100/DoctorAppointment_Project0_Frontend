import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { USER_ROLES } from '../utils/constants';

// Layouts
import PublicLayout from '../LayOut/PublicLayout';
import AuthLayout from '../LayOut/AuthLayout';
import PatientLayout from '../LayOut/PatientLayout';
import DoctorLayout from '../LayOut/DoctorLayout';
import AdminLayout from '../LayOut/AdminLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Public & Auth Pages
import HomePage from '../Pages/Public/HomePage';
import DoctorListPage from '../Pages/Public/DoctorListPage';
import NotFoundPage from '../Pages/Public/NotFoundPage';
import LoginPage from '../Pages/Auth/LoginPage';
import RegisterPage from '../Pages/Auth/RegisterPage';
import UnauthorizedPage from '../Pages/Auth/UnauthorizedPage';

// Patient Pages
import PatientDashboard from '../Pages/Patient/PatientDashboard';
import BookAppointmentPage from '../Pages/Patient/BookAppointmentPage';
import PatientAppointments from '../Pages/Patient/PatientAppointments';

// Doctor Pages
import DoctorDashboard from '../Pages/Doctor/DoctorDashboard';
import DoctorAppointments from '../Pages/Doctor/DoctorAppointments';
import DoctorSchedulePage from '../Pages/Doctor/DoctorSchedulePage';

// Admin Pages
import AdminDashboard from '../Pages/Admin/AdminDashboard';
import ManageDoctorsPage from '../Pages/Admin/ManageDoctorsPage';
import ManagePatientsPage from '../Pages/Admin/ManagePatientsPage';
import ManageAppointmentsPage from '../Pages/Admin/ManageAppointmentsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Visitor Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctors" element={<DoctorListPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* 2. Public Authentication Routes (Redirects if already logged in) */}
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 3. Patient Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]} />}>
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="book-appointment" element={<BookAppointmentPage />} />
          <Route path="appointments" element={<PatientAppointments />} />
        </Route>
      </Route>

      {/* 4. Doctor Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]} />}>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="schedule" element={<DoctorSchedulePage />} />
        </Route>
      </Route>

      {/* 5. Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="doctors" element={<ManageDoctorsPage />} />
          <Route path="patients" element={<ManagePatientsPage />} />
          <Route path="appointments" element={<ManageAppointmentsPage />} />
        </Route>
      </Route>

      {/* 6. Catch-all 404 Route */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
