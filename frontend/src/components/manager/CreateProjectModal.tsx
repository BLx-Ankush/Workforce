import React, { useState } from 'react';
import { X, Plus, Trash2, Cpu, CheckCircle } from 'lucide-react';
import { api } from '../../api';
import { ProjectRoleSlot, Department, Skill } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
  departments: Department[];
  skills: Skill[];
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
  departments,
  skills,
}) => {
  const [title, setTitle] = useState('New Enterprise Initiative');
  const [description, setDescription] = useState('Cloud analytics and scalable data ingestion microservices.');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept_cloud');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [durationWeeks, setDurationWeeks] = useState(6);

  // Role slots
  const [roleSlots, setRoleSlots] = useState<ProjectRoleSlot[]>([
    {
      roleId: 'slot_1',
      roleName: 'Cloud Solutions Architect',
      mandatorySkills: { 'AWS': 4 },
      preferredSkills: { 'Data Analytics': 3 },
      minExperienceYears: 3.5,
      hoursPerWeek: 15.0,
    },
    {
      roleId: 'slot_2',
      roleName: 'Lead Data Engineer',
      mandatorySkills: { 'Python': 4 },
      preferredSkills: { 'Data Analytics': 4 },
      minExperienceYears: 3.0,
      hoursPerWeek: 15.0,
    },
  ]);

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddRoleSlot = () => {
    const newSlot: ProjectRoleSlot = {
      roleId: `slot_${Date.now()}`,
      roleName: 'Specialist Role',
      mandatorySkills: { 'Python': 3 },
      preferredSkills: {},
      minExperienceYears: 2.0,
      hoursPerWeek: 15.0,
    };
    setRoleSlots([...roleSlots, newSlot]);
  };

  const handleRemoveRoleSlot = (idx: number) => {
    setRoleSlots(roleSlots.filter((_, i) => i !== idx));
  };

  const handleUpdateRoleSlot = (idx: number, field: keyof ProjectRoleSlot, value: any) => {
    const updated = [...roleSlots];
    updated[idx] = { ...updated[idx], [field]: value };
    setRoleSlots(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || roleSlots.length === 0) return;

    setSaving(true);
    try {
      const created = await api.createProject({
        title,
        description,
        departmentId,
        priority,
        durationWeeks,
        roleSlots,
      });
      onProjectCreated(created.id);
      onClose();
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Create Project & Define Skill Requirements
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify role requirements, mandatory technical skills, and weekly capacity.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Owning Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Weeks)</label>
              <input
                type="number"
                min={1}
                max={52}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Role Slots Builder */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Required Role Slots ({roleSlots.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  CP-SAT will match candidates covering these mandatory skills within capacity bounds.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRoleSlot}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Role Slot
              </button>
            </div>

            <div className="space-y-3">
              {roleSlots.map((slot, idx) => (
                <div key={slot.roleId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={slot.roleName}
                      onChange={(e) => handleUpdateRoleSlot(idx, 'roleName', e.target.value)}
                      placeholder="Role Title (e.g. Cloud Architect)"
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium flex-1 focus:outline-none focus:border-indigo-500"
                    />
                    {roleSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRoleSlot(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Mandatory Skill & Min Prof</label>
                      <div className="flex items-center gap-1">
                        <select
                          value={Object.keys(slot.mandatorySkills)[0] || 'Python'}
                          onChange={(e) => {
                            const curProf = Object.values(slot.mandatorySkills)[0] || 4;
                            handleUpdateRoleSlot(idx, 'mandatorySkills', { [e.target.value]: curProf });
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 flex-1"
                        >
                          {skills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                        <select
                          value={Object.values(slot.mandatorySkills)[0] || 4}
                          onChange={(e) => {
                            const curSkill = Object.keys(slot.mandatorySkills)[0] || 'Python';
                            handleUpdateRoleSlot(idx, 'mandatorySkills', { [curSkill]: parseInt(e.target.value, 10) });
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                        >
                          <option value="3">&ge; 3/5</option>
                          <option value="4">&ge; 4/5</option>
                          <option value="5">5/5</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Min Experience (Years)</label>
                      <input
                        type="number"
                        step={0.5}
                        min={0}
                        value={slot.minExperienceYears}
                        onChange={(e) => handleUpdateRoleSlot(idx, 'minExperienceYears', parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Hours / Week</label>
                      <input
                        type="number"
                        min={5}
                        max={40}
                        value={slot.hoursPerWeek}
                        onChange={(e) => handleUpdateRoleSlot(idx, 'hoursPerWeek', parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {saving ? 'Creating Project...' : 'Create Project & Optimize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
