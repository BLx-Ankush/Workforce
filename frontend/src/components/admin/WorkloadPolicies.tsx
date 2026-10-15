import React, { useEffect, useState } from 'react';
import { Sliders, ShieldAlert, CheckCircle2, Save, Flame, Cpu } from 'lucide-react';
import { api } from '../../api';

export const WorkloadPolicies: React.FC = () => {
  const [blockingThreshold, setBlockingThreshold] = useState(90.0);
  const [maxUtilization, setMaxUtilization] = useState(100.0);
  const [allowExceptions, setAllowExceptions] = useState(false);
  const [requireAudit, setRequireAudit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const p = await api.getWorkloadPolicies();
        setBlockingThreshold(p.highRiskBlockingThreshold || 90.0);
        setMaxUtilization(p.maxUtilizationThreshold || 100.0);
        setAllowExceptions(p.allowManagerExceptions || false);
        setRequireAudit(p.requireAuditJustification ?? true);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPolicies();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.updateWorkloadPolicies({
        highRiskBlockingThreshold: blockingThreshold,
        maxUtilizationThreshold: maxUtilization,
        allowManagerExceptions: allowExceptions,
        requireAuditJustification: requireAudit,
      });
      setSavedSuccess(true);
    } catch (err: any) {
      alert(`Save error: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            Safety & Fatigue Governance
          </span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Workload Protection Policies</h2>
        <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
          Configure workforce capacity constraints and burnout protection limits enforced
          by the Google OR-Tools CP-SAT optimizer across all team formations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          {/* Threshold Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  Fatigue Risk Hard Blocking Threshold
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Employees at or above this score are mathematically excluded from proposed assignments.
                </p>
              </div>
              <span className="text-lg font-bold font-mono text-rose-400 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                {blockingThreshold} / 100
              </span>
            </div>

            <input
              type="range"
              min={70}
              max={95}
              step={1}
              value={blockingThreshold}
              onChange={(e) => setBlockingThreshold(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>70 (Strict Protection)</span>
              <span className="text-indigo-400 font-semibold">90 (Default Standard)</span>
              <span>95 (Permissive)</span>
            </div>
          </div>

          {/* Max Utilization */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Maximum Contracted Utilization</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Cap on total weekly project allocations relative to contracted capacity.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={80}
                max={120}
                value={maxUtilization}
                onChange={(e) => setMaxUtilization(parseFloat(e.target.value))}
                className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400">%</span>
            </div>
          </div>

          {/* Exceptions Toggle */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Allow Manager Overwrite Exceptions</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Permits project managers to bypass the 90/100 threshold with written justification.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowExceptions}
              onChange={(e) => setAllowExceptions(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Audit Logging Toggle */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Mandatory Immutable Audit Logging</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Enforces cryptographically ordered audit trail for all team approvals and reassignments.
              </p>
            </div>
            <input
              type="checkbox"
              checked={requireAudit}
              onChange={(e) => setRequireAudit(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Policies updated & actively enforced across all solvers!
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save & Enforce Policies'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
