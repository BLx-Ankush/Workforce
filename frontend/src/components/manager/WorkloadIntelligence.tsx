import React, { useEffect, useState } from 'react';
import {
  RefreshCw, Flame, UserCheck, TrendingDown, CheckCircle2
} from 'lucide-react';
import { api } from '../../api';
import { Employee, WorkloadSummary } from '../../types';
import { WorkloadGauge } from '../common/WorkloadGauge';
import { SkillBadge } from '../common/SkillBadge';

export const WorkloadIntelligence: React.FC = () => {
  const [summary, setSummary] = useState<WorkloadSummary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'overloaded' | 'underutilized' | 'available'>('overloaded');
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
      <div className="glass-panel p-6 rounded-2xl bg-white border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase tracking-wider font-mono">
              Scenario B: Workload Imbalance Resolver
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">Workload Intelligence & Fatigue Protection</h2>
          <p className="text-xs text-zinc-500 max-w-xl mt-1 leading-relaxed">
            Monitors real-time employee allocation against contracted weekly hours.
            Protects staff from unsustainable workloads by blocking assignments exceeding risk policy.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 text-xs font-semibold flex items-center gap-2 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          Recalculate Live Metrics
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('overloaded')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'overloaded'
              ? 'bg-black text-white shadow-sm'
              : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
          }`}
        >
          <Flame className="w-4 h-4" />
          Overloaded & Blocked ({summary?.overloadedCount || 0})
        </button>

        <button
          onClick={() => setActiveTab('underutilized')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'underutilized'
              ? 'bg-black text-white shadow-sm'
              : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Underutilized Talent ({summary?.underutilizedCount || 0})
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'available'
              ? 'bg-black text-white shadow-sm'
              : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Available Capacity ({summary?.availableCapacityCount || 0})
        </button>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-700 leading-relaxed">
        {activeTab === 'overloaded' && (
          <p>
            <strong className="text-zinc-900 font-bold">Fatigue Protection Active:</strong> Employees in this category currently exceed the 90/100 risk threshold or are allocated beyond 100% capacity. The CP-SAT team optimizer strictly blocks them from being chosen for new projects, automatically recommending qualified alternatives instead.
          </p>
        )}
        {activeTab === 'underutilized' && (
          <p>
            <strong className="text-zinc-900 font-bold">Underutilized Talent:</strong> Employees working below 40% of contracted weekly hours. Ideal candidates to staff incoming initiatives, close skill gaps, or rebalance workloads from overloaded peers.
          </p>
        )}
        {activeTab === 'available' && (
          <p>
            <strong className="text-zinc-900 font-bold">Readily Deployable Capacity:</strong> Employees with at least 15 hours of uncommitted weekly bandwidth and healthy workload risk (&lt; 75/100).
          </p>
        )}
      </div>

      {/* Employees Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-[11px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-50">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Weekly Allocated</th>
                <th className="py-3 px-4">Available Bandwidth</th>
                <th className="py-3 px-4">Fatigue Risk Index</th>
                <th className="py-3 px-4">Top Skills</th>
                <th className="py-3 px-4 text-right">Policy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-zinc-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.githubAvatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`}
                        alt={emp.name}
                        className="w-8 h-8 rounded-lg object-cover border border-zinc-200 bg-zinc-100"
                      />
                      <div>
                        <p className="font-bold text-zinc-900">{emp.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-600 font-medium">{emp.title}</td>
                  <td className="py-3.5 px-4 font-mono font-medium">
                    <span className={emp.utilizationRate > 100 ? 'text-black font-extrabold' : 'text-zinc-800'}>
                      {emp.allocatedHours}h / {emp.weeklyCapacityHours}h ({emp.utilizationRate}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-900 font-bold">
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
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-black text-white border border-black font-mono">
                        <Flame className="w-3 h-3 text-white" />
                        Assignment Blocked
                      </span>
                    ) : emp.availableHours >= 15 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-300">
                        <CheckCircle2 className="w-3 h-3 text-black" />
                        Deployable
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-xs font-medium">Partially Committed</span>
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
