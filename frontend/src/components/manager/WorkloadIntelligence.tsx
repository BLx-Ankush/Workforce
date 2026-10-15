import React, { useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, TrendingDown,
  RefreshCw, Flame, UserCheck, ArrowRight, ShieldAlert
} from 'lucide-react';
import { api } from '../../api';
import { Employee, WorkloadSummary } from '../../types';
import { WorkloadGauge } from '../common/WorkloadGauge';
import { SkillBadge } from '../common/SkillBadge';

export const WorkloadIntelligence: React.FC = () => {
  const [summary, setSummary] = useState<WorkloadSummary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'overloaded' | 'underutilized' | 'available'>('overloaded');
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchData = async () => {
    try {
      const [sumRes, empRes] = await Promise.all([
        api.getWorkloadSummary(),
        api.getWorkloadEmployees(activeTab),
      ]);
      setSummary(sumRes);
      setEmployees(empRes.employees);
    } catch (err) {
      console.error('Failed to load workload intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await api.getWorkloadSummary();
      await fetchData();
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Scenario B: Workload Imbalance Resolver
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Workload Intelligence & Fatigue Protection</h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Monitors real-time employee allocation against contracted weekly hours.
            Protects staff from unsustainable workloads by blocking assignments exceeding risk policy.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          Recalculate Live Metrics
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overloaded')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'overloaded'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          Overloaded & Blocked ({summary?.overloadedCount || 0})
        </button>

        <button
          onClick={() => setActiveTab('underutilized')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'underutilized'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-cyan-400" />
          Underutilized Talent ({summary?.underutilizedCount || 0})
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'available'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          Available Capacity ({summary?.availableCapacityCount || 0})
        </button>
      </div>

      {/* Explanation Banner */}
      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
        activeTab === 'overloaded'
          ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
          : activeTab === 'underutilized'
          ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-300'
          : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
      }`}>
        {activeTab === 'overloaded' && (
          <p>
            <strong className="text-white">Fatigue Protection Active:</strong> Employees in this category currently exceed the 90/100 risk threshold or are allocated beyond 100% capacity. The CP-SAT team optimizer strictly blocks them from being chosen for new projects, automatically recommending qualified alternatives instead.
          </p>
        )}
        {activeTab === 'underutilized' && (
          <p>
            <strong className="text-white">Underutilized Talent:</strong> Employees working below 40% of contracted weekly hours. Ideal candidates to staff incoming initiatives, close skill gaps, or rebalance workloads from overloaded peers.
          </p>
        )}
        {activeTab === 'available' && (
          <p>
            <strong className="text-white">Readily Deployable Capacity:</strong> Employees with at least 15 hours of uncommitted weekly bandwidth and healthy workload risk (&lt; 75/100).
          </p>
        )}
      </div>

      {/* Employees Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400 bg-slate-950/40">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Weekly Allocated</th>
                <th className="py-3 px-4">Available Bandwidth</th>
                <th className="py-3 px-4">Fatigue Risk Index</th>
                <th className="py-3 px-4">Top Skills</th>
                <th className="py-3 px-4 text-right">Policy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.githubAvatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`}
                        alt={emp.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                      />
                      <div>
                        <p className="font-semibold text-white">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{emp.title}</td>
                  <td className="py-3.5 px-4 font-mono font-medium">
                    <span className={emp.utilizationRate > 100 ? 'text-rose-400 font-bold' : 'text-white'}>
                      {emp.allocatedHours}h / {emp.weeklyCapacityHours}h ({emp.utilizationRate}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                    {emp.availableHours}h Free
                  </td>
                  <td className="py-3.5 px-4">
                    <WorkloadGauge score={emp.workloadRiskScore} utilization={emp.utilizationRate} size="sm" showLabel={false} />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(emp.skills || {}).slice(0, 3).map((sk) => (
                        <SkillBadge key={sk} name={sk} isVerified={emp.verifiedSkills?.includes(sk)} size="sm" />
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {emp.workloadRiskScore >= 90 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                        Assignment Blocked
                      </span>
                    ) : emp.availableHours >= 15 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Deployable
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Partially Committed</span>
                    )}
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
