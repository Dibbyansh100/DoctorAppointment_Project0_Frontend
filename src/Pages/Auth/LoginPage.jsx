import React, { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../Components/Common';
import { Mail, Lock, AlertCircle, Shield, Stethoscope, User } from 'lucide-react';
import { USER_ROLES } from '../../utils/constants';

const INITIAL_FORM = {
  email: '',
  password: '',
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const errors = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const destination =
        location.state?.from?.pathname ||
        (user.userRole === USER_ROLES.ADMIN
          ? '/admin/dashboard'
          : user.userRole === USER_ROLES.DOCTOR
          ? '/doctor/dashboard'
          : '/patient/dashboard');

      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = useCallback((demoEmail, demoPassword) => {
    setFormData({ email: demoEmail, password: demoPassword });
    setErrorMessage('');
    setFieldErrors({});
  }, []);

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Sign in to your account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your appointment dashboard and medical schedules
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleInputChange}
          error={fieldErrors.email}
          icon={Mail}
          required
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleInputChange}
          error={fieldErrors.password}
          icon={Lock}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Quick-Fill helper */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <p className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Demo Credentials
        </p>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill('admin@gmail.com', 'Admin@123')}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">admin@gmail.com</p>
          </button>

          <button
            type="button"
            onClick={() => handleDemoFill('doctor@gmail.com', 'Doctor@123')}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>Doctor</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">doctor@gmail.com</p>
          </button>

          <button
            type="button"
            onClick={() => handleDemoFill('rahul@gmail.com', 'Rahul@123')}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Patient</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">rahul@gmail.com</p>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
