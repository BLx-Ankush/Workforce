import React, { useEffect, useState } from 'react';
import {
  AlertOctagon, AlertTriangle, ShieldCheck, CheckCircle2,
  Cpu, ArrowRight, UserX, RefreshCw, Flame
} from 'lucide-react';
import { api } from '../../api';
import { Project, Employee } from '../../types';
import { SkillBadge } from '../common/SkillBadge';

export const EmergencyRecoverySimulator: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [unavailableEmpId, setUnavailableEmpId] = useState<string>('');
  const [simulating, setSimulating] = useState(false);
  const [recoveryData, setRecoveryData] = useState<any>(null);
  const [approving, setApproving] = useState(false);
  const [recoveryApproved, setRecoveryApproved] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.getProjects();
        setProjects(res.projects);
        // Find first staffed or active project
        const staffed = res.projects.find(p => p.status === 'STAFFED' || (p.assignedTeam && p.assignedTeam.length > 0));
        if (staffed) {
          setSelectedProjectId(staffed.id);
          if (staffed.assignedTeam && staffed.assignedTeam.length > 0) {
            setUnavailableEmpId(staffed.assignedTeam[0].employeeId);
          }
        } else if (res.projects.length > 0) {
          setSelectedProjectId(res.projects[0].id);
        }
      } catch (err) {
        console.error('Failed to load projects for recovery:', err);
      }
    };
    fetchProjects();
  }, []);

  const currentProject = projects.find(p => p.id === selectedProjectId);

  const handleSimulateDisruption = async () => {
    if (!selectedProjectId || !unavailableEmpId) return;
    setSimulating(true);
    setRecoveryApproved(false);
    try {
      const result = await api.simulateDisruption(selectedProjectId, unavailableEmpId);
      setRecoveryData(result);
    } catch (err: any) {
      alert(`Simulation error: ${err}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleApproveRecovery = async () => {
    if (!recoveryData || !selectedProjectId) return;
    setApproving(true);
    try {
      const targetSlot = currentProject?.roleSlots.find(s => s.roleName === recoveryData.affected_role_name);
      const roleId = targetSlot ? targetSlot.roleId : currentProject?.roleSlots[0]?.roleId || 'slot_1';

      await api.approveRecovery(
        selectedProjectId,
        roleId,
        recoveryData.new_employee_id,
        recoveryData.replaced_employee_id
      );
      setRecoveryApproved(true);
    } catch (err: any) {
      alert(`Approval error: ${err}`);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-950 border border-rose-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
            Resilience & Contingency Recovery Engine
          </span>
          <span className="text-xs text-slate-400">What-If Staffing Simulator</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Emergency Project Reoptimization</h2>
        <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
          When an employee becomes unavailable due to sick leave, emergency, or reassignment, the CP-SAT optimizer
          preserves all unaffected team members and identifies the optimal replacement candidate without violating safety policies.
        </p>
      </div>

      {/* Simulator Control Box */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          Step 1: Configure Staffing Disruption Event
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const proj = projects.find(p => p.id === e.target.value);
                if (proj?.assignedTeam && proj.assignedTeam.length > 0) {
                  setUnavailableEmpId(proj.assignedTeam[0].employeeId);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Employee Becoming Unavailable</label>
            <select
              value={unavailableEmpId}
              onChange={(e) => setUnavailableEmpId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              {currentProject?.assignedTeam && currentProject.assignedTeam.length > 0 ? (
                currentProject.assignedTeam.map((m) => (
                  <option key={m.employeeId} value={m.employeeId}>
                    {m.employeeName} — {m.roleName} ({m.assignedHours}h/wk)
                  </option>
                ))
              ) : (
                <option value="emp_rahul">Rahul Sharma (Cloud Solutions Architect)</option>
              )}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSimulateDisruption}
            disabled={simulating}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/30"
          >
            <UserX className="w-4 h-4" />
            {simulating ? 'Running CP-SAT Reoptimization...' : 'Trigger Absence & Reoptimize'}
          </button>
        </div>
      </div>

      {/* Recovery Proposal Result */}
      {recoveryData && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Emergency Recovery Plan Formulated</h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Status: {recoveryData.solver_status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{recoveryData.explanation}</p>
            </div>

            {/* Approval Action */}
            {recoveryApproved ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-4 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                Replacement Approved & Authoritative Roster Restored!
              </div>
            ) : (
              <button
                onClick={handleApproveRecovery}
                disabled={approving || !recoveryData.success}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4" />
                {approving ? 'Committing Changes...' : 'Approve Recovery & Commit Replacement'}
              </button>
            )}
          </div>

          {/* Before & After Team Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Unaffected Preserved Members */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Preserved Team Members ({recoveryData.preserved_members_count})
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Unaffected members are preserved without disruption to maintain project continuity.
              </p>
              <div className="space-y-2">
                {recoveryData.recovered_team?.assigned_members
                  ?.filter((m: any) => m.employee_id !== recoveryData.new_employee_id)
                  ?.map((m: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{m.employee_name}</span>
                        <span className="text-[10px] text-slate-400">{m.role_name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Preserved
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Optimal Replacement Member */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                CP-SAT Recommended Replacement
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Replaces unavailable staff for role: <strong className="text-white">{recoveryData.affected_role_name}</strong>.
              </p>

              {recoveryData.recovered_team?.assigned_members?.find((m: any) => m.employee_id === recoveryData.new_employee_id) && (
                (() => {
                  const rep = recoveryData.recovered_team.assigned_members.find((m: any) => m.employee_id === recoveryData.new_employee_id);
                  return (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-indigo-400 uppercase font-bold block">{rep.role_name}</span>
                          <span className="font-bold text-white text-sm">{rep.employee_name}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          Match: {rep.individual_suitability_score}/100
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Assigned Bandwidth:</span>
                        <span className="font-mono text-white font-semibold">{rep.assigned_hours}h / week</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Post-Utilization:</span>
                        <span className="font-mono text-emerald-400 font-semibold">{rep.utilization_after}% (Healthy)</span>
                      </div>
                      <div className="text-[11px] text-slate-300 italic pt-1">
                        "{rep.decision_rationale}"
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
