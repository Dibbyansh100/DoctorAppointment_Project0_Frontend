import React, { useState, useEffect, useMemo, useCallback } from 'react';
import doctorApi from '../../api/doctorApi';
import { Button, Input, Modal, Badge } from '../../Components/Common';
import { Stethoscope, Plus, Search, Edit2, Power, AlertCircle, RefreshCw, DollarSign, Phone, Mail } from 'lucide-react';

const INITIAL_FORM = {
  name: '',
  email: '',
  phoneNumber: '',
  specialization: '',
  consultationFee: '',
};

export function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State (for both Create and Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specializations, setSpecializations] = useState([]);

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await doctorApi.getDoctors(specializationFilter);
      const list = Array.isArray(data) ? data : [];
      setDoctors(list);

      // Build dynamic specialization list from full (unfiltered) data
      if (!specializationFilter) {
        const uniqueSpecs = [...new Set(list.map((d) => d.specialization).filter(Boolean))].sort();
        setSpecializations(uniqueSpecs);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load doctors.');
    } finally {
      setIsLoading(false);
    }
  }, [specializationFilter]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleOpenCreateModal = useCallback(() => {
    setEditingDoctor(null);
    setFormData(INITIAL_FORM);
    setFieldErrors({});
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((doc) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name || '',
      email: doc.email || '',
      phoneNumber: doc.phoneNumber || '',
      specialization: doc.specialization || '',
      consultationFee: String(doc.consultationFee ?? ''),
    });
    setFieldErrors({});
    setIsModalOpen(true);
  }, []);

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMessage('');
    setSuccessMessage('');

    const feeNum = parseFloat(formData.consultationFee);
    if (isNaN(feeNum) || feeNum < 0) {
      setFieldErrors((prev) => ({ ...prev, consultationFee: 'Fee must be a non-negative number' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        specialization: formData.specialization.trim(),
        consultationFee: feeNum,
      };

      if (editingDoctor) {
        await doctorApi.updateDoctor(editingDoctor.id, payload);
        setSuccessMessage(`Doctor "${payload.name}" updated successfully.`);
      } else {
        await doctorApi.createDoctor(payload);
        setSuccessMessage(`Doctor "${payload.name}" registered successfully.`);
      }

      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setErrorMessage(err.message || 'Failed to save doctor.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = useCallback(async (doc) => {
    const action = doc.active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} doctor "${doc.name}"?`)) {
      return;
    }

    setActionLoadingId(doc.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      if (doc.active) {
        await doctorApi.deactivateDoctor(doc.id);
        setSuccessMessage(`Doctor "${doc.name}" has been deactivated.`);
      } else {
        await doctorApi.activateDoctor(doc.id);
        setSuccessMessage(`Doctor "${doc.name}" has been activated.`);
      }
      fetchDoctors();
    } catch (err) {
      setErrorMessage(err.message || `Failed to ${action} doctor.`);
    } finally {
      setActionLoadingId(null);
    }
  }, [fetchDoctors]);

  // Memoize search filtering to prevent recalculation when typing in modal or toggling loading
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    const query = searchQuery.toLowerCase();
    return doctors.filter(
      (doc) =>
        doc.name?.toLowerCase().includes(query) ||
        doc.email?.toLowerCase().includes(query) ||
        doc.specialization?.toLowerCase().includes(query)
    );
  }, [doctors, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Doctors</h1>
          <p className="text-xs text-slate-500 mt-1">
            Register new physicians, update medical specialties, manage consultation fees, and toggle status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDoctors}
            icon={RefreshCw}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            icon={Plus}
          >
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between animate-fade-in">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-800 font-bold ml-2">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-800 font-bold ml-2">×</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none bg-white focus:border-indigo-500"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-10 bg-slate-100 rounded" />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No doctors found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or register a new doctor.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Specialization</th>
                  <th className="px-5 py-3.5">Consultation Fee</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => {
                  const isActing = actionLoadingId === doc.id;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                            {doc.name.charAt(0)}
                          </div>
                          <div>
                            <p>{doc.name}</p>
                            <span className="text-[10px] text-slate-400 font-normal">{doc.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                          {doc.specialization}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-semibold text-slate-800">
                        ${Number(doc.consultationFee).toFixed(2)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                        {doc.phoneNumber}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge status={doc.active ? 'ACTIVE' : 'INACTIVE'} />
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit2}
                          onClick={() => handleOpenEditModal(doc)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant={doc.active ? 'danger' : 'success'}
                          size="sm"
                          icon={Power}
                          isLoading={isActing}
                          onClick={() => handleToggleActive(doc)}
                        >
                          {doc.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? 'Edit Doctor Details' : 'Register New Doctor'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Doctor Name"
            name="name"
            placeholder="Dr. John Smith"
            value={formData.name}
            onChange={handleInputChange}
            error={fieldErrors.name}
            required
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="doctor@example.com"
              value={formData.email}
              onChange={handleInputChange}
              error={fieldErrors.email}
              required
            />

            <Input
              label="Phone Number"
              name="phoneNumber"
              placeholder="+1-555-0123"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              error={fieldErrors.phoneNumber}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Specialization"
              name="specialization"
              placeholder="e.g. Cardiology, Neurology"
              value={formData.specialization}
              onChange={handleInputChange}
              error={fieldErrors.specialization}
              required
            />

            <Input
              label="Consultation Fee ($)"
              name="consultationFee"
              type="number"
              step="0.01"
              min="0"
              placeholder="150.00"
              value={formData.consultationFee}
              onChange={handleInputChange}
              error={fieldErrors.consultationFee}
              required
            />
          </div>

          {!editingDoctor && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 animate-fade-in">
              <p className="font-semibold">Doctor Login Credentials</p>
              <p className="mt-0.5 text-slate-600">
                A DOCTOR login account will automatically be created. The doctor can sign in with this email and default password: <code className="bg-white px-1.5 py-0.5 rounded text-indigo-700 font-bold border border-indigo-200">Doctor@123</code>
              </p>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {editingDoctor ? 'Update Doctor' : 'Create Doctor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ManageDoctorsPage;
