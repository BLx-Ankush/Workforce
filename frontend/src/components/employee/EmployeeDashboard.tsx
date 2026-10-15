import React, { useEffect, useState } from 'react';
import {
  FolderGit2, Clock, Activity, ShieldCheck,
  Calendar, CheckCircle, ArrowRight, User
} from 'lucide-react';
import { GithubIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Employee, Project, Meeting } from '../../types';
import { WorkloadGauge } from '../common/WorkloadGauge';
import { SkillBadge } from '../common/SkillBadge';

interface EmployeeDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onOpenMeeting: (meeting: Meeting) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  onNavigateTab,
  onOpenMeeting,
}) => {
  const { employee, user } = useAuth();
  const [empDetails, setEmpDetails] = useState<any>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpData = async () => {
      const empId = employee?.id || 'emp_rahul';
      try {
        const [empRes, meetRes] = await Promise.all([
          api.getEmployeeById(empId),
          api.getMeetings({ employeeId: empId }),
        ]);
        setEmpDetails(empRes);
        setMeetings(meetRes.meetings);
      } catch (err) {
        console.error('Failed to load employee dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmpData();
  }, [employee]);

  const emp = empDetails?.employee || employee;

  return (
    <div className="space-y-6">
      {/* Hero Profile Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={emp?.githubAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={emp?.name || 'Employee'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{emp?.name || 'Rahul Sharma'}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                {emp?.employeeId || 'EMP-1001'}
              </span>
            </div>
            <p className="text-xs text-indigo-300 font-medium">{emp?.title || 'Senior Cloud Solutions Architect'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{emp?.email} • {emp?.experienceYears} yrs experience</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('github')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition"
          >
            <GithubIcon className="w-4 h-4 text-white" />
            GitHub Connected
          </button>
          <button
            onClick={() => onNavigateTab('profile')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
          >
            View Live Portfolio
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Workload Health */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Personal Workload & Capacity
            </span>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-2xl font-bold text-white font-mono">{emp?.allocatedHours || 0}h</p>
                <p className="text-xs text-slate-400 mt-0.5">Assigned of {emp?.weeklyCapacityHours || 40}h capacity</p>
              </div>
              <WorkloadGauge
                score={emp?.workloadRiskScore || 20}
                utilization={emp?.utilizationRate || 25}
                size="md"
                showLabel={false}
              />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Free Bandwidth:</span>
            <span className="font-bold text-emerald-400 font-mono">{emp?.availableHours || 30}h / week</span>
          </div>
        </div>

        {/* Verified Badges Count */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Verified Technical Credentials
            </span>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-2xl font-bold text-emerald-400 font-mono">
                  {emp?.verifiedBadges?.length || 2} Badges
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Verified via GitHub & PR audits</p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 text-[11px] text-indigo-300 font-medium flex items-center justify-between">
            <span>Verified Skills:</span>
            <span>{(emp?.verifiedSkills || []).join(', ') || 'AWS, Data Analytics'}</span>
          </div>
        </div>

        {/* Mentorship Capacity */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Practical Mentorship Track
            </span>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-2xl font-bold text-white font-mono">{emp?.mentorCapacityHours || 4}h / wk</p>
                <p className="text-xs text-slate-400 mt-0.5">Supervising junior developers</p>
              </div>
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Active Mentees:</span>
            <span className="text-white font-semibold">1 Mentorship in progress</span>
          </div>
        </div>
      </div>

      {/* Active Assignments and Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Project Assignments */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              My Current Project Assignments
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {empDetails?.activeAssignments?.length || 1} Active
            </span>
          </div>

          <div className="space-y-3">
            {empDetails?.activeAssignments?.length > 0 ? (
              empDetails.activeAssignments.map((asgn: any) => (
                <div key={asgn.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                      {asgn.roleName}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-0.5">{asgn.projectId}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Allocated: {asgn.weeklyHours}h / week</p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    ● ACTIVE
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                Currently available for project staffing.
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Meetings */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Upcoming Team Meetings
            </h3>
            <span className="text-xs text-slate-400 font-mono">Google Meet Adapter</span>
          </div>

          <div className="space-y-3">
            {meetings.length > 0 ? (
              meetings.map((meet) => (
                <div key={meet.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-xs">{meet.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(meet.scheduledAt).toLocaleString()} ({meet.durationMinutes} mins)
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenMeeting(meet)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    Join Room
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                No meetings scheduled today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
