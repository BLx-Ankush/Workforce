import React, { useEffect, useState } from 'react';
import {
  Search, Filter, ShieldCheck, Flame, Briefcase,
  Calendar, ExternalLink, X, ArrowUpDown
} from 'lucide-react';
import { api } from '../../api';
import { Employee, Department, Skill } from '../../types';
import { SkillBadge } from '../common/SkillBadge';
import { WorkloadGauge } from '../common/WorkloadGauge';

export const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Inspector Modal
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [empRes, deptRes, skillRes] = await Promise.all([
          api.getEmployees(),
          api.getDepartments(),
          api.getSkills(),
        ]);
        setEmployees(empRes.employees);
        setDepartments(deptRes.departments);
        setSkills(skillRes.skills);
      } catch (err) {
        console.error('Failed to load employees directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchRole = emp.title.toLowerCase().includes(q);
      const matchId = emp.employeeId.toLowerCase().includes(q);
      const matchSkill = Object.keys(emp.skills || {}).some(k => k.toLowerCase().includes(q));
      if (!matchName && !matchRole && !matchId && !matchSkill) return false;
    }
    if (selectedDept && emp.departmentId !== selectedDept) return false;
    if (selectedSkill && !(emp.skills || {})[selectedSkill]) return false;
    if (statusFilter && emp.availabilityStatus !== statusFilter) return false;
    if (verifiedOnly && (!emp.verifiedSkills || emp.verifiedSkills.length === 0)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, employee ID, or skill (e.g. AWS, Python)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Skill Filter */}
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Skills</option>
            {skills.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="PARTIALLY_COMMITTED">Partially Committed</option>
            <option value="OVERLOADED">Overloaded (Risk &ge; 90)</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>

          {/* Verified toggle */}
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
              verifiedOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Skills Only
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Showing <strong className="text-white">{filteredEmployees.length}</strong> of {employees.length} employees</span>
        <span>Click employee card to inspect live assignments & workload breakdown</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const isOverloaded = emp.workloadRiskScore >= 90;

          return (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className={`glass-panel p-5 rounded-2xl glass-card-hover cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isOverloaded ? 'border-rose-500/30 bg-rose-950/10' : ''
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.githubAvatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`}
                      alt={emp.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700 bg-slate-800"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                        {emp.name}
                          <span title="Verified Badge Holder">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          </span>
                      </h4>
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">{emp.title}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{emp.employeeId} • {emp.experienceYears} yrs</span>
                    </div>
                  </div>

                  {/* Overload Alert Pill */}
                  {isOverloaded && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                      BLOCKED
                    </span>
                  )}
                </div>

                {/* Top Skills */}
                <div className="mb-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">Demonstrated Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(emp.skills || {}).slice(0, 4).map(([skill, prof]) => (
                      <SkillBadge
                        key={skill}
                        name={skill}
                        proficiency={prof}
                        isVerified={emp.verifiedSkills?.includes(skill)}
                        size="sm"
                      />
                    ))}
                    {Object.keys(emp.skills || {}).length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        +{Object.keys(emp.skills || {}).length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Workload Gauge */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Fatigue Risk Index</p>
                  <WorkloadGauge score={emp.workloadRiskScore} utilization={emp.utilizationRate} showLabel={false} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Allocated</p>
                  <p className="text-xs font-mono font-bold text-white">
                    {emp.allocatedHours}h / {emp.weeklyCapacityHours}h
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {emp.availableHours}h free
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspector Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
              <div className="flex items-center gap-4">
                <img
                  src={selectedEmployee.githubAvatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`}
                  alt={selectedEmployee.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedEmployee.name}
                    <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {selectedEmployee.employeeId}
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-400">{selectedEmployee.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedEmployee.email} • {selectedEmployee.experienceYears} Years Experience</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Workload Health Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Workload Health & Assignment Protection</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedEmployee.workloadRiskScore >= 90
                      ? 'Protected by Workforce Safety Policy: Blocked from further project assignments to prevent burnout.'
                      : 'Healthy workload capacity available for project assignments.'}
                  </p>
                </div>
                <WorkloadGauge
                  score={selectedEmployee.workloadRiskScore}
                  utilization={selectedEmployee.utilizationRate}
                  showLabel={true}
                />
              </div>

              {/* Skills and Badges */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Technical Skills & Verification Badges
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedEmployee.skills || {}).map(([sk, prof]) => (
                    <SkillBadge
                      key={sk}
                      name={sk}
                      proficiency={prof}
                      isVerified={selectedEmployee.verifiedSkills?.includes(sk)}
                      size="md"
                    />
                  ))}
                </div>
              </div>

              {/* Verified Badges */}
              {selectedEmployee.verifiedBadges?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Verified Badges Awarded
                  </h4>
                  <div className="space-y-2">
                    {selectedEmployee.verifiedBadges.map((badge, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="font-semibold text-emerald-300">{badge.badgeName}</p>
                            <p className="text-[11px] text-slate-400">{badge.evidenceSource}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{badge.issuedDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Summary */}
              {selectedEmployee.portfolioSummary && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Professional Summary & GitHub Track Record
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {selectedEmployee.portfolioSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
