import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import doctorApi from '../../api/doctorApi';
import { DoctorCard } from '../../Components/Doctors';
import { Stethoscope, Search, AlertCircle } from 'lucide-react';

export function DoctorListPage() {
  const { isAuthenticated, isPatient } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [specializations, setSpecializations] = useState([]);

  const fetchDoctors = useCallback(async (spec) => {
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
  }, []);

  useEffect(() => {
    fetchDoctors(specialization);
  }, [specialization, fetchDoctors]);

  // Memoize search filtering to prevent recalculation on unrelated renders
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    const query = searchQuery.toLowerCase();
    return doctors.filter(
      (doc) =>
        doc.name?.toLowerCase().includes(query) ||
        doc.specialization?.toLowerCase().includes(query) ||
        doc.email?.toLowerCase().includes(query)
    );
  }, [doctors, searchQuery]);

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
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 outline-none bg-white"
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
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="h-3 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
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
            <DoctorCard
              key={doc.id}
              doctor={doc}
              isAuthenticated={isAuthenticated}
              isPatient={isPatient}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorListPage;
