import React, { useEffect, useState } from 'react';
import {
  FolderGit2, Plus, Sparkles, CheckCircle, Clock,
  AlertTriangle, Users, Calendar, ArrowRight
} from 'lucide-react';
import { api } from '../../api';
import { Project, Department, Skill } from '../../types';
import { CreateProjectModal } from './CreateProjectModal';

interface ProjectListProps {
  onSelectProjectForOptimization: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProjectForOptimization }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const [projRes, deptRes, skillRes] = await Promise.all([
        api.getProjects(),
        api.getDepartments(),
        api.getSkills(),
      ]);
      setProjects(projRes.projects);
      setDepartments(deptRes.departments);
      setSkills(skillRes.skills);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (newId: string) => {
    fetchProjects();
    onSelectProjectForOptimization(newId);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Project Portfolios & Staffing Deployments</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage projects, define skill requirements, and execute CP-SAT team optimization.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const isStaffed = proj.status === 'STAFFED';
          const isDisrupted = proj.status === 'DISRUPTED';
          const isOptimized = proj.status === 'OPTIMIZED';

          return (
            <div
              key={proj.id}
              className="glass-panel p-5 rounded-2xl flex flex-col justify-between glass-card-hover border border-slate-800"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                    proj.priority === 'Critical'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : proj.priority === 'High'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  }`}>
                    {proj.priority} Priority
                  </span>

                  <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                    isStaffed
                      ? 'text-emerald-400'
                      : isDisrupted
                      ? 'text-rose-400 animate-pulse'
                      : 'text-indigo-400'
                  }`}>
                    {isStaffed && <CheckCircle className="w-3.5 h-3.5" />}
                    {isDisrupted && <AlertTriangle className="w-3.5 h-3.5" />}
                    ● {proj.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base mb-1">{proj.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {proj.description}
                </p>

                {/* Duration & Slots Meta */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{proj.durationWeeks} Weeks</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{proj.teamSize} Role Slots</span>
                  </div>
                </div>

                {/* Required Roles & Mandatory Skills */}
                <div className="space-y-1.5 mb-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Required Role Slots</p>
                  {proj.roleSlots.map((slot, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                      <span className="text-slate-300 font-medium truncate max-w-[150px]">{slot.roleName}</span>
                      <span className="text-[10px] text-indigo-400 font-mono">
                        {Object.entries(slot.mandatorySkills || {}).map(([k, v]) => `${k} ≥ ${v}`).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Assigned Team if Staffed */}
                {isStaffed && proj.assignedTeam && proj.assignedTeam.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 mb-4">
                    <p className="text-[10px] uppercase font-bold text-emerald-400 mb-1.5">Active Staffed Team</p>
                    <div className="space-y-1">
                      {proj.assignedTeam.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center justify-between text-xs">
                          <span className="text-white font-medium">{m.employeeName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{m.assignedHours}h/wk</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectProjectForOptimization(proj.id)}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition ${
                  isStaffed
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                {isStaffed ? 'Re-Evaluate Team Optimizer' : 'Find Best Team (CP-SAT)'}
              </button>
            </div>
          );
        })}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
        departments={departments}
        skills={skills}
      />
    </div>
  );
};
