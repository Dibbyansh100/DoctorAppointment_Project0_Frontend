import React from 'react';

/**
 * Metric card used across Patient, Doctor, and Admin dashboards to highlight key counts.
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'indigo',
  subtitle,
  loading = false,
}) {
  const colorSchemes = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <div className={`bg-white rounded-xl p-5 border ${scheme.border} shadow-xs hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-slate-200 animate-pulse rounded my-1"></div>
          ) : (
            <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
          )}
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
