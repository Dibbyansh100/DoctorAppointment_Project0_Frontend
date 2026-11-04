import React, { useState, useEffect, useMemo, useCallback } from 'react';
import patientApi from '../../api/patientApi';
import { Button, Input, Modal, Badge } from '../../Components/Common';
import { Users, Plus, Search, Edit2, Power, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';

const INITIAL_FORM = {
  name: '',
  email: '',
  phoneNumber: '',
};

export function ManagePatientsPage() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await patientApi.getAllPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load patients list.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleOpenCreateModal = useCallback(() => {
    setEditingPatient(null);
    setFormData(INITIAL_FORM);
    setFieldErrors({});
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((pat) => {
    setEditingPatient(pat);
    setFormData({
      name: pat.name || '',
      email: pat.email || '',
      phoneNumber: pat.phoneNumber || '',
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

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      };

      if (editingPatient) {
        await patientApi.updatePatient(editingPatient.id, payload);
        setSuccessMessage(`Patient "${payload.name}" updated successfully.`);
      } else {
        await patientApi.createPatient(payload);
        setSuccessMessage(`Patient "${payload.name}" created successfully.`);
      }

      setIsModalOpen(false);
      fetchPatients();
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setErrorMessage(err.message || 'Failed to save patient.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = useCallback(async (pat) => {
    const action = pat.active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} patient "${pat.name}"?`)) {
      return;
    }

    setActionLoadingId(pat.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      if (pat.active) {
        await patientApi.deactivatePatient(pat.id);
        setSuccessMessage(`Patient "${pat.name}" deactivated.`);
      } else {
        await patientApi.activatePatient(pat.id);
        setSuccessMessage(`Patient "${pat.name}" activated.`);
      }
      fetchPatients();
    } catch (err) {
      setErrorMessage(err.message || `Failed to ${action} patient.`);
    } finally {
      setActionLoadingId(null);
    }
  }, [fetchPatients]);

  const copyPatientId = useCallback((id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Memoize search query filter to prevent unnecessary table recalculations
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(
      (pat) =>
        pat.name?.toLowerCase().includes(query) ||
        pat.email?.toLowerCase().includes(query) ||
        pat.phoneNumber?.toLowerCase().includes(query)
    );
  }, [patients, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Patients</h1>
          <p className="text-xs text-slate-500 mt-1">
            Register patient medical profiles, copy entity UUIDs for booking sync, and manage account statuses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatients}
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
            Add Patient
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

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, email, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Patient Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-10 bg-slate-100 rounded" />
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No patients found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or register a new patient.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Patient UUID</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((pat) => {
                  const isActing = actionLoadingId === pat.id;
                  const isCopied = copiedId === pat.id;

                  return (
                    <tr key={pat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            {pat.name.charAt(0)}
                          </div>
                          <div>
                            <p>{pat.name}</p>
                            <span className="text-[10px] text-slate-400 font-normal">{pat.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => copyPatientId(pat.id)}
                          title="Click to copy full UUID"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-mono text-[11px] text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                          <span>{pat.id.slice(0, 13)}...</span>
                        </button>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                        {pat.phoneNumber}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge status={pat.active ? 'ACTIVE' : 'INACTIVE'} />
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit2}
                          onClick={() => handleOpenEditModal(pat)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant={pat.active ? 'danger' : 'success'}
                          size="sm"
                          icon={Power}
                          isLoading={isActing}
                          onClick={() => handleToggleActive(pat)}
                        >
                          {pat.active ? 'Deactivate' : 'Activate'}
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

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPatient ? 'Edit Patient Profile' : 'Register New Patient'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleInputChange}
            error={fieldErrors.name}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="patient@example.com"
            value={formData.email}
            onChange={handleInputChange}
            error={fieldErrors.email}
            required
          />

          <Input
            label="Phone Number"
            name="phoneNumber"
            placeholder="+1-555-0199"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            error={fieldErrors.phoneNumber}
            required
          />

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
              {editingPatient ? 'Update Patient' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ManagePatientsPage;
