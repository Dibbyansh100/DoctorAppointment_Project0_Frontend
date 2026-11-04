import React from 'react';
import { APPOINTMENT_STATUS } from '../../utils/constants';

/**
 * Visual status pill/badge with color-coding and dot indicator.
 */
export function Badge({ status, label, className = '' }) {
  const normalized = (status || '').toUpperCase();

  const configs = {
    [APPOINTMENT_STATUS.SCHEDULED]: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      defaultLabel: 'Scheduled',
    },
    [APPOINTMENT_STATUS.COMPLETED]: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      defaultLabel: 'Completed',
    },
    [APPOINTMENT_STATUS.CANCELLED]: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      defaultLabel: 'Cancelled',
    },
    ACTIVE: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      defaultLabel: 'Active',
    },
    INACTIVE: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      defaultLabel: 'Inactive',
    },
  };

  const config = configs[normalized] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    defaultLabel: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.defaultLabel}
    </span>
  );
}

export default Badge;
