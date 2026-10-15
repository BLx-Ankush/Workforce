import React, { useEffect, useState } from 'react';
import {
  Users, Activity, FolderGit2, CheckCircle2, AlertTriangle,
  Sparkles, ArrowRight, TrendingUp, ShieldAlert, Cpu
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { api } from '../../api';
import { WorkloadSummary, Project, Department } from '../../types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';

interface ManagerOverviewProps {
  onNavigateTab: (tabId: string) => void;
  onSelectProjectForOptimization: (projectId: string) => void;
}

export const ManagerOverview: React.FC<ManagerOverviewProps> = ({
  onNavigateTab,
  onSelectProjectForOptimization,
}) => {
  const [summary, setSummary] = useState<WorkloadSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, projRes, deptRes] = await Promise.all([
          api.getWorkloadSummary(),
          api.getProjects(),
          api.getDepartments(),
        ]);
        setSummary(sumRes);
        setProjects(projRes.projects);
        setDepartments(deptRes.departments);
      } catch (err) {
        console.error('Error fetching manager overview data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Cpu className="w-6 h-6 animate-spin mr-2 text-indigo-500" />
        Calculating real-time workforce metrics...
      </div>
    );
  }

  // Chart data
  const deptData = departments.map(d => ({
    name: d.code,
    headcount: d.headCount,
    utilization: d.averageUtilization || 35,
  }));

  const workloadPieData = [
    { name: 'Optimal Load', value: summary.totalEmployees - summary.overloadedCount - summary.underutilizedCount, color: '#10b981' },
    { name: 'Underutilized', value: summary.underutilizedCount, color: '#38bdf8' },
    { name: 'Overloaded (Risk > 90)', value: summary.overloadedCount, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden p-6 glass-panel border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Decision Intelligence Dashboard
              </span>
              <span className="text-xs text-slate-400">Database Live Records</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Workforce Capacity & Team Optimization</h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Constraint-based staffing engine balancing employee skills, project capacity, and fatigue-aware risk limits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('optimizer')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Cpu className="w-4 h-4" />
              Launch CP-SAT Optimizer
            </button>
            <button
              onClick={() => onNavigateTab('recovery')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Emergency Recovery Simulator
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Workforce"
          value={summary.totalEmployees}
          subtitle={`${departments.length} enterprise departments`}
          icon={Users}
          badge="Active Pool"
          badgeColor="indigo"
          onClick={() => onNavigateTab('employees')}
        />
        <MetricCard
          title="Available Capacity"
          value={`${summary.remainingCapacityHours}h`}
          subtitle={`${summary.availableCapacityCount} ready specialists`}
          icon={TrendingUp}
          badge="Healthy Margin"
          badgeColor="cyan"
          onClick={() => onNavigateTab('workload')}
        />
        <MetricCard
          title="Overloaded Staff"
          value={summary.overloadedCount}
          subtitle={`Blocked at Risk >= ${summary.blockingThreshold}`}
          icon={AlertTriangle}
          badge="Policy Protected"
          badgeColor="rose"
          onClick={() => onNavigateTab('workload')}
        />
        <MetricCard
          title="Active Projects"
          value={projects.length}
          subtitle={`${projects.filter(p => p.status === 'STAFFED').length} currently staffed`}
          icon={FolderGit2}
          badge="In Delivery"
          badgeColor="emerald"
          onClick={() => onNavigateTab('projects')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Utilization */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Department Capacity & Utilization</h3>
              <p className="text-xs text-slate-400">Headcount and average utilization percentage by department</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Avg Utilization: <span className="text-indigo-400 font-bold">{summary.averageUtilizationRate}%</span>
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="headcount" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Headcount" />
                <Bar dataKey="utilization" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Avg Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Health Breakdown */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">Fatigue-Aware Workload Distribution</h3>
            <p className="text-xs text-slate-400">Risk index calculated from live project commitments</p>
          </div>

          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workloadPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {workloadPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-3">
            {workloadPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Requiring Attention Table */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-sm">Projects Ready for Staffing Optimization</h3>
            <p className="text-xs text-slate-400">Launch constraint-based CP-SAT solver to construct optimal complementary teams</p>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            View all projects <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
                <th className="py-2.5 px-3">Project Title</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Team Slots</th>
                <th className="py-2.5 px-3">Mandatory Skills</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Optimization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {projects.slice(0, 3).map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-3">
                    <p className="font-medium text-white">{proj.title}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{proj.description}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                      proj.priority === 'Critical'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : proj.priority === 'High'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {proj.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">{proj.teamSize} members</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {proj.roleSlots.map((slot, sIdx) => (
                        <span key={sIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {Object.keys(slot.mandatorySkills || {}).join(', ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[11px] font-semibold ${
                      proj.status === 'STAFFED' ? 'text-emerald-400' : 'text-indigo-400'
                    }`}>
                      ● {proj.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectProjectForOptimization(proj.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Optimize
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
