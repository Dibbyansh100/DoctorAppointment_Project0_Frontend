import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../Components/Common';
import { Mail, Lock, AlertCircle, Shield, Stethoscope, User } from 'lucide-react';
import { USER_ROLES } from '../../utils/constants';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    if (!email) {
      setFieldErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({ email, password });
      
      // Determine destination after login
      const destination = location.state?.from?.pathname || (
        user.userRole === USER_ROLES.ADMIN
          ? '/admin/dashboard'
          : user.userRole === USER_ROLES.DOCTOR
          ? '/doctor/dashboard'
          : '/patient/dashboard'
      );

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

  // Quick fill helper for backend initialized demo users
  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    setFieldErrors({});
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Sign in to your account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your appointment dashboard and medical schedules
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          icon={Lock}
          required
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Quick-Fill Bar */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 text-center mb-2.5">
          Quick Demo Credentials (Initialized in Backend)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill('admin@gmail.com', 'Admin@123')}
            className="flex flex-col items-center p-2 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 transition-colors text-purple-700 cursor-pointer"
          >
            <Shield className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-bold">Admin</span>
            <span className="text-[9px] text-purple-600 font-mono">admin@gmail.com</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoFill('doctor@gmail.com', 'Doctor@123')}
            className="flex flex-col items-center p-2 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 transition-colors text-blue-700 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-bold">Doctor</span>
            <span className="text-[9px] text-blue-600 font-mono">doctor@gmail.com</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoFill('rahul@gmail.com', 'Rahul@123')}
            className="flex flex-col items-center p-2 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 transition-colors text-indigo-700 cursor-pointer"
          >
            <User className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-bold">Patient</span>
            <span className="text-[9px] text-indigo-600 font-mono">rahul@gmail.com</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign up as a patient
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
