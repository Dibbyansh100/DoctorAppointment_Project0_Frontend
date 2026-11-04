import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import doctorApi from '../../api/doctorApi';
import { Badge, Button } from '../../Components/Common';
import { Stethoscope, Phone, Mail, DollarSign, Search, AlertCircle } from 'lucide-react';

export function DoctorListPage() {
  const { isAuthenticated, isPatient } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [specializations, setSpecializations] = useState([]);

  const fetchDoctors = async (spec) => {
    setLoading(true);
    setError('');
    try {
      const data = await doctorApi.getDoctors(spec);
      const list = Array.isArray(data) ? data : [];
      setDoctors(list);
      // Build unique specializations from full (unfiltered) doctor list
      if (!spec) {
        const uniqueSpecs = [...new Set(list.map((d) => d.specialization).filter(Boolean))].sort();
        setSpecializations(uniqueSpecs);
      }
    } catch (err) {
      setError(err.message || 'Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(specialization);
  }, [specialization]);

  // Client-side name/email filter on top of the backend specialization filter
  const filteredDoctors = doctors.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.specialization.toLowerCase().includes(query) ||
      doc.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Our Medical Specialists</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Browse verified doctors, view consultation fees, and book your visit
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by doctor name or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="h-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No doctors found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{doc.name}</h3>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px] mt-0.5">
                        {doc.specialization}
                      </span>
                    </div>
                  </div>
                  <Badge status={doc.active ? 'ACTIVE' : 'INACTIVE'} />
                </div>

                <div className="space-y-2 text-xs text-slate-600 py-3 border-y border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{doc.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Consultation Fee: ${Number(doc.consultationFee).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-1">
                {isAuthenticated && isPatient ? (
                  <Link to={`/patient/book-appointment?doctorId=${doc.id}`}>
                    <Button variant="primary" className="w-full">
                      Book Appointment
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      Sign in to Book
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorListPage;
