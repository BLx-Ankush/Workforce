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
  const [recoveryDeclined, setRecoveryDeclined] = useState(false);

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
    setRecoveryDeclined(false);
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
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 font-mono">
            Resilience & Contingency Recovery Engine
          </span>
          <span className="text-xs text-zinc-500">What-If Staffing Simulator</span>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Emergency Project Reoptimization</h2>
        <p className="text-xs text-zinc-600 max-w-2xl mt-1 leading-relaxed">
          When an employee becomes unavailable due to sick leave, emergency, or reassignment, the CP-SAT optimizer
          preserves all unaffected team members and identifies the optimal replacement candidate without violating safety policies.
        </p>
      </div>

      {/* Simulator Control Box */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <h3 className="font-semibold text-zinc-900 text-sm flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-zinc-900" />
          Step 1: Configure Staffing Disruption Event
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Target Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const proj = projects.find(p => p.id === e.target.value);
                if (proj?.assignedTeam && proj.assignedTeam.length > 0) {
                  setUnavailableEmpId(proj.assignedTeam[0].employeeId);
                }
              }}
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-black font-medium"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Employee Becoming Unavailable</label>
            <select
              value={unavailableEmpId}
              onChange={(e) => setUnavailableEmpId(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-black font-medium"
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
            className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
          >
            <UserX className="w-4 h-4" />
            {simulating ? 'Running CP-SAT Reoptimization...' : 'Trigger Absence & Reoptimize'}
          </button>
        </div>
      </div>

      {/* Recovery Proposal Result */}
      {recoveryData && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-300 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                <h3 className="text-base font-bold text-zinc-900">Emergency Recovery Plan Formulated</h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-zinc-100 text-zinc-900 border border-zinc-300">
                  Status: {recoveryData.solver_status}
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-1">{recoveryData.explanation}</p>
            </div>

            {/* Approval Action */}
            <div className="flex flex-wrap items-center gap-3">
              {recoveryApproved ? (
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 bg-zinc-100 border border-zinc-300 px-4 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                  Replacement Approved & Authoritative Roster Restored!
                </div>
              ) : recoveryDeclined ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 px-4 py-2 rounded-xl">
                  Current team retained. Exploring alternate staffing or timeline adjustments.
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setRecoveryDeclined(true)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-semibold text-xs transition"
                  >
                    Keep Current Team & Explore Other Options
                  </button>
                  <button
                    onClick={handleApproveRecovery}
                    disabled={approving || !recoveryData.success}
                    className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    {approving ? 'Committing Changes...' : 'Approve Recovery & Commit Replacement'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Before & After Team Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Unaffected Preserved Members */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-zinc-900" />
                Preserved Team Members ({recoveryData.preserved_members_count})
              </h4>
              <p className="text-[11px] text-zinc-500 mb-3">
                Unaffected members are preserved without disruption to maintain project continuity.
              </p>
              <div className="space-y-2">
                {recoveryData.recovered_team?.assigned_members
                  ?.filter((m: any) => m.employee_id !== recoveryData.new_employee_id)
                  ?.map((m: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-zinc-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-zinc-900 block">{m.employee_name}</span>
                        <span className="text-[10px] text-zinc-500">{m.role_name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-200 font-medium">
                        Preserved
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Optimal Replacement Member */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-zinc-900" />
                CP-SAT Recommended Replacement
              </h4>
              <p className="text-[11px] text-zinc-500 mb-3">
                Replaces unavailable staff for role: <strong className="text-zinc-900">{recoveryData.affected_role_name}</strong>.
              </p>

              {recoveryData.recovered_team?.assigned_members?.find((m: any) => m.employee_id === recoveryData.new_employee_id) && (
                (() => {
                  const rep = recoveryData.recovered_team.assigned_members.find((m: any) => m.employee_id === recoveryData.new_employee_id);
                  return (
                    <div className="p-3.5 rounded-xl bg-white border border-zinc-300 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">{rep.role_name}</span>
                          <span className="font-bold text-zinc-900 text-sm">{rep.employee_name}</span>
                        </div>
                        <span className="text-xs font-bold text-zinc-900 font-mono">
                          Match: {rep.individual_suitability_score}/100
                        </span>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-600">
                        <span>Assigned Bandwidth:</span>
                        <span className="font-mono text-zinc-900 font-semibold">{rep.assigned_hours}h / week</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-600">
                        <span>Post-Utilization:</span>
                        <span className="font-mono text-zinc-900 font-semibold">{rep.utilization_after}% (Healthy)</span>
                      </div>
                      <div className="text-[11px] text-zinc-600 italic pt-1">
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
