import React, { useEffect, useState } from 'react';
import {
  Cpu, Sparkles, CheckCircle2, ShieldCheck, AlertTriangle,
  ArrowRight, ShieldAlert, Award, Clock, Users, RefreshCw, Flame
} from 'lucide-react';
import { api } from '../../api';
import { Project, OptimizationResponse, TeamSolution, AssignedMember } from '../../types';
import { SkillBadge } from '../common/SkillBadge';
import { WorkloadGauge } from '../common/WorkloadGauge';

interface TeamOptimizerViewProps {
  initialProjectId?: string;
  onNavigateTab: (tabId: string) => void;
}

export const TeamOptimizerView: React.FC<TeamOptimizerViewProps> = ({
  initialProjectId,
  onNavigateTab,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '');
  const [optimization, setOptimization] = useState<OptimizationResponse | null>(null);
  const [activeTeamTab, setActiveTeamTab] = useState<'primary' | 'backup_a' | 'backup_b'>('primary');
  const [optimizing, setOptimizing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [showAlternativeDrawer, setShowAlternativeDrawer] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.getProjects();
        setProjects(res.projects);
        if (!selectedProjectId && res.projects.length > 0) {
          setSelectedProjectId(res.projects[0].id);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    fetchProjects();
  }, []);

  const handleRunOptimizer = async () => {
    if (!selectedProjectId) return;
    setOptimizing(true);
    setApprovalSuccess(false);
    try {
      const res = await api.optimizeProject(selectedProjectId);
      setOptimization(res);
      setActiveTeamTab('primary');
    } catch (err) {
      console.error('Optimization failed:', err);
    } finally {
      setOptimizing(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      handleRunOptimizer();
    }
  }, [selectedProjectId]);

  const currentProject = projects.find(p => p.id === selectedProjectId);

  // Active solution to display
  let currentSolution: TeamSolution | undefined;
  if (activeTeamTab === 'primary') {
    currentSolution = optimization?.primary_team;
  } else if (activeTeamTab === 'backup_a') {
    currentSolution = optimization?.backup_teams?.find(t => t.team_type === 'backup_a');
  } else if (activeTeamTab === 'backup_b') {
    currentSolution = optimization?.backup_teams?.find(t => t.team_type === 'backup_b');
  }

  const handleApproveTeam = async () => {
    if (!currentSolution || !selectedProjectId) return;
    setApproving(true);
    try {
      const payload = currentSolution.assigned_members.map(m => ({
        roleId: m.role_id,
        employeeId: m.employee_id,
        assignedHours: m.assigned_hours,
      }));

      await api.approveTeam(selectedProjectId, payload);
      setApprovalSuccess(true);
    } catch (err: any) {
      alert(`Approval error: ${err}`);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 font-mono">
              Google OR-Tools CP-SAT Solver v9.15
            </span>
            <span className="text-xs text-zinc-500">Combinatorial Optimization Engine</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Complementary Team Optimizer</h2>
          <p className="text-xs text-zinc-600 max-w-xl mt-0.5">
            Solves multi-objective team configuration guaranteeing 100% mandatory skill coverage,
            maximizing complementary capabilities, and enforcing workload safety policies.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-black font-medium"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.teamSize} Slots)
              </option>
            ))}
          </select>

          <button
            onClick={handleRunOptimizer}
            disabled={optimizing}
            className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <Sparkles className={`w-3.5 h-3.5 ${optimizing ? 'animate-spin' : ''}`} />
            {optimizing ? 'Solving CP-SAT...' : 'Find Best Team'}
          </button>
        </div>
      </div>

      {/* Solver Execution Stats & Tabs */}
      {optimization && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-zinc-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Solution Pool:</span>
              <button
                onClick={() => setActiveTeamTab('primary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTeamTab === 'primary'
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-zinc-700 hover:text-black border border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                🥇 Primary Team (Highest Suitability)
              </button>

              {optimization.backup_teams?.some(t => t.team_type === 'backup_a') && (
                <button
                  onClick={() => setActiveTeamTab('backup_a')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTeamTab === 'backup_a'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-white text-zinc-700 hover:text-black border border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  🥈 Backup Team A (Resilient Option)
                </button>
              )}

              {optimization.backup_teams?.some(t => t.team_type === 'backup_b') && (
                <button
                  onClick={() => setActiveTeamTab('backup_b')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTeamTab === 'backup_b'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-white text-zinc-700 hover:text-black border border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  🥉 Backup Team B (Contingency)
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-500 font-mono">
                CP-SAT Status: <strong className="text-zinc-900 font-bold">{optimization.solver_status}</strong>
              </span>
              <span className="text-zinc-500 font-mono">
                Solve Time: <strong className="text-zinc-900">{optimization.solver_time_ms}ms</strong>
              </span>
            </div>
          </div>

          {/* Explanation narrative */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed flex items-start gap-3">
            <Cpu className="w-5 h-5 text-zinc-900 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-900 mb-0.5">Automated Explainable Staffing Rationale</p>
              <p>{currentSolution?.explanation || optimization.human_explanation}</p>
            </div>
          </div>

          {/* Blocked candidate note & drawer toggle */}
          {optimization.rejected_candidates?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-zinc-900" />
                <span className="text-zinc-800">
                  <strong>Fatigue Protection Intercepted:</strong> {optimization.rejected_candidates.length} qualified candidate(s) were blocked by Workload Risk Policy (Risk &ge; 90). Healthy alternatives were selected instead.
                </span>
              </div>
              <button
                onClick={() => setShowAlternativeDrawer(!showAlternativeDrawer)}
                className="text-xs font-bold text-black underline underline-offset-2 ml-4 whitespace-nowrap"
              >
                {showAlternativeDrawer ? 'Hide Candidate Breakdown' : 'Inspect Blocked vs Alternatives'}
              </button>
            </div>
          )}

          {/* Alternative Candidates Drawer */}
          {showAlternativeDrawer && (
            <div className="bg-white p-5 rounded-2xl border border-zinc-300 space-y-3 shadow-sm animate-in fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-zinc-900" />
                Why Preferred Candidates Were Blocked & Alternatives Chosen
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {optimization.rejected_candidates.map((rej, rIdx) => (
                  <div key={rIdx} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900">{rej.employee_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-black text-white">
                        {rej.reason_code}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600">Target Role: <span className="text-zinc-900 font-medium">{rej.role_name}</span></p>
                    <p className="text-[11px] text-zinc-700 leading-relaxed">{rej.explanation}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Individual Match Score: {rej.suitability_score}/100 (Blocked)</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solution Team Members Cards */}
          {currentSolution && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                  {currentSolution.team_label} Roster ({currentSolution.assigned_members.length} Members)
                  <span className="text-xs font-normal text-zinc-500">
                    Suitability Score: <strong className="text-zinc-900 font-mono">{currentSolution.total_score}/100</strong>
                  </span>
                </h3>

                {/* Approve Team Button */}
                <div className="flex items-center gap-3">
                  {approvalSuccess ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 bg-zinc-100 border border-zinc-300 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                      Team Approved & Persisted to DB!
                    </div>
                  ) : (
                    <button
                      onClick={handleApproveTeam}
                      disabled={approving}
                      className="px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      {approving ? 'Committing Assignments...' : 'Approve & Commit Team'}
                    </button>
                  )}
                </div>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSolution.assigned_members.map((member, mIdx) => (
                  <div
                    key={mIdx}
                    className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-zinc-300 transition"
                  >
                    <div>
                      {/* Role & Name */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                            {member.role_name}
                          </span>
                          <h4 className="font-bold text-zinc-900 text-base mt-0.5">{member.employee_name}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {member.experience_years} yrs exp • {member.assigned_hours}h / week
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-right">
                          <span className="text-[10px] text-zinc-500 block">Suitability</span>
                          <span className="text-sm font-bold text-zinc-900 font-mono">
                            {member.individual_suitability_score}
                          </span>
                        </div>
                      </div>

                      {/* Complementary Skills Covered */}
                      <div className="mb-3">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5">Mandatory Skills Satisfied</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(member.skills_covered || {}).map(([sk, prof]) => (
                            <SkillBadge
                              key={sk}
                              name={sk}
                              proficiency={prof}
                              isVerified={member.verified_skills_used?.includes(sk)}
                              size="sm"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Decision Rationale */}
                      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700 leading-relaxed">
                        <span className="text-zinc-900 font-semibold block mb-0.5">Complementary Contribution:</span>
                        {member.decision_rationale}
                      </div>
                    </div>

                    {/* Pre vs Post Workload Impact */}
                    <div className="pt-3 border-t border-zinc-200 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Pre-Assignment</span>
                        <span className="font-mono text-zinc-700">
                          {member.utilization_before}% Util (Risk: {member.workload_risk_before})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block font-semibold">Post-Assignment</span>
                        <span className="font-mono font-bold text-zinc-900">
                          {member.utilization_after}% Util (Risk: {member.workload_risk_after})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
