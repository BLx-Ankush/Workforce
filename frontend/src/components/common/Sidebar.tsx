import React from 'react';
import {
  LayoutDashboard, Users, Activity, FolderGit2, Cpu,
  AlertOctagon, GraduationCap, Calendar, ShieldCheck,
  FileText, Sliders, History, Building2, Tag
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { role } = useAuth();

  const managerItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees & Skills', icon: Users },
    { id: 'workload', label: 'Workload Intelligence', icon: Activity },
    { id: 'projects', label: 'Projects & Staffing', icon: FolderGit2 },
    { id: 'optimizer', label: 'Team Optimizer', icon: Cpu, badge: 'CP-SAT' },
    { id: 'recovery', label: 'Emergency Recovery', icon: AlertOctagon, badge: 'What-If' },
    { id: 'mentorship', label: 'Skill Gaps & Training', icon: GraduationCap },
    { id: 'meetings', label: 'Team Meetings', icon: Calendar },
  ];

  const employeeItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Verified Resume & Portfolio', icon: FileText },
    { id: 'github', label: 'GitHub Contributions', icon: GithubIcon, badge: 'OAuth' },
    { id: 'workload', label: 'My Workload & Leave', icon: Activity },
    { id: 'learning', label: 'Mentorship & Upskilling', icon: GraduationCap },
    { id: 'meetings', label: 'Scheduled Meetings', icon: Calendar },
  ];

  const adminItems = [
    { id: 'overview', label: 'Org Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'Employee Administration', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'skills', label: 'Skill Taxonomy', icon: Tag },
    { id: 'verification', label: 'Verification Queue', icon: ShieldCheck, badge: 'Badges' },
    { id: 'policies', label: 'Workload Safety Policies', icon: Sliders },
    { id: 'audit', label: 'Audit Logs', icon: History },
  ];

  const navItems = role === 'MANAGER'
    ? managerItems
    : role === 'EMPLOYEE'
    ? employeeItems
    : adminItems;

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col justify-between p-4 shrink-0 shadow-[1px_0_2px_rgba(0,0,0,0.02)]">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 px-3 mb-2">
            {role} Portal Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-black text-white font-semibold shadow-sm'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      isActive ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500">
        <p className="font-semibold text-zinc-900 mb-0.5">Workforce Intelligence</p>
        <p className="text-[10px] leading-relaxed text-zinc-500">
          Google OR-Tools CP-SAT + Fatigue-Aware Recovery Pipeline.
        </p>
      </div>
    </aside>
  );
};
