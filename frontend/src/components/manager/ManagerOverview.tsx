import React, { useEffect, useState } from 'react';
import {
  Users, FolderGit2, AlertTriangle, Sparkles, ArrowRight, TrendingUp, ShieldAlert, Cpu
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
      <div className="flex items-center justify-center h-64 text-zinc-400 font-medium">
        <Cpu className="w-5 h-5 animate-spin mr-2 text-black" />
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
    { name: 'Optimal Load', value: summary.totalEmployees - summary.overloadedCount - summary.underutilizedCount, color: '#18181b' },
    { name: 'Underutilized', value: summary.underutilizedCount, color: '#71717a' },
    { name: 'Overloaded (Risk > 90)', value: summary.overloadedCount, color: '#d4d4d8' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl p-6 glass-panel border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase tracking-wider font-mono">
                Workforce Intelligence Platform
              </span>
              <span className="text-xs text-zinc-500 font-medium">Authoritative Database Records</span>
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Workforce Capacity & Team Optimization</h2>
            <p className="text-xs text-zinc-500 max-w-2xl mt-1 leading-relaxed">
              Combinatorial constraint optimization balancing technical capabilities, project capacity, and fatigue-aware risk limits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('optimizer')}
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
            >
              <Cpu className="w-4 h-4" />
              Launch CP-SAT Optimizer
            </button>
            <button
              onClick={() => onNavigateTab('recovery')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 font-semibold text-xs transition flex items-center gap-2 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-zinc-900" />
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
          onClick={() => onNavigateTab('employees')}
        />
        <MetricCard
          title="Available Capacity"
          value={`${summary.remainingCapacityHours}h`}
          subtitle={`${summary.availableCapacityCount} ready specialists`}
          icon={TrendingUp}
          badge="Healthy Bandwidth"
          onClick={() => onNavigateTab('workload')}
        />
        <MetricCard
          title="Overloaded Staff"
          value={summary.overloadedCount}
          subtitle={`Blocked at Risk >= ${summary.blockingThreshold}`}
          icon={AlertTriangle}
          badge="Policy Blocked"
          onClick={() => onNavigateTab('workload')}
        />
        <MetricCard
          title="Active Projects"
          value={projects.length}
          subtitle={`${projects.filter(p => p.status === 'STAFFED').length} currently staffed`}
          icon={FolderGit2}
          badge="In Delivery"
          onClick={() => onNavigateTab('projects')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Utilization */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Department Capacity & Utilization</h3>
              <p className="text-xs text-zinc-500">Headcount and average utilization percentage by department</p>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              Avg Utilization: <span className="text-zinc-900 font-bold">{summary.averageUtilizationRate}%</span>
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="headcount" fill="#18181b" radius={[4, 4, 0, 0]} name="Headcount" />
                <Bar dataKey="utilization" fill="#71717a" radius={[4, 4, 0, 0]} name="Avg Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Health Breakdown */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">Fatigue-Aware Workload Distribution</h3>
            <p className="text-xs text-zinc-500">Risk index calculated from live commitments</p>
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
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-zinc-100 pt-3">
            {workloadPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-zinc-900 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Ready for Optimization Table */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">Projects Ready for Staffing Optimization</h3>
            <p className="text-xs text-zinc-500">Launch constraint-based CP-SAT solver to construct optimal complementary teams</p>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs text-zinc-900 hover:text-black flex items-center gap-1 font-semibold"
          >
            View all projects <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-[11px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-50/50">
                <th className="py-3 px-3">Project Title</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Team Slots</th>
                <th className="py-3 px-3">Mandatory Skills</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Optimization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {projects.slice(0, 3).map((proj) => (
                <tr key={proj.id} className="hover:bg-zinc-50/80 transition">
                  <td className="py-3 px-3">
                    <p className="font-bold text-zinc-900">{proj.title}</p>
                    <p className="text-[11px] text-zinc-500 truncate max-w-xs">{proj.description}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border border-zinc-300 bg-zinc-100 text-zinc-800">
                      {proj.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-zinc-700">{proj.teamSize} members</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {proj.roleSlots.map((slot, sIdx) => (
                        <span key={sIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 font-mono">
                          {Object.keys(slot.mandatorySkills || {}).join(', ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-bold text-zinc-900 font-mono">
                      ● {proj.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectProjectForOptimization(proj.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
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
