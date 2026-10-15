import React, { useEffect, useState } from 'react';
import {
  GraduationCap, CheckCircle2, Circle, Clock, User,
  ArrowRight, ShieldCheck, Award, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Mentorship } from '../../types';

export const LearningMentorship: React.FC = () => {
  const { employee } = useAuth();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMentorshipData = async () => {
    try {
      const [pairRes, gapRes] = await Promise.all([
        api.getMentorshipPairings(),
        api.getSkillGaps(),
      ]);
      setMentorships(pairRes);
      setSkillGaps(gapRes.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  const handleToggleMilestone = async (mentorshipId: string, milestoneId: string, currentVal: boolean) => {
    try {
      await api.updateMilestone(mentorshipId, milestoneId, !currentVal);
      await fetchMentorshipData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            Practical Mentorship Engine
          </span>
          <span className="text-xs text-slate-400">Supervised Real-World Project Tracks</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Active Upskilling & Mentor Partnerships</h2>
        <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
          Replaces passive video courses with hands-on, senior-supervised project deliverables.
          Complete practical milestones to earn verified badges.
        </p>
      </div>

      {/* Active Mentorships */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          Active Supervised Mentorships ({mentorships.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mentorships.map((m) => {
            const completedCount = m.milestones.filter(ms => ms.completed).length;
            const progressPct = Math.round((completedCount / max(1, m.milestones.length)) * 100);

            return (
              <div key={m.id} className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                      Target Skill Mastery
                    </span>
                    <h4 className="font-bold text-white text-lg">{m.targetSkill} Specialization</h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Mentor: <strong className="text-white">{m.mentorName}</strong> ({m.weeklyHours}h/wk supervised)
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    ● ACTIVE
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Deliverables Progress</span>
                    <span className="font-mono font-bold text-white">{completedCount}/{m.milestones.length} Completed ({progressPct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Milestones list */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Practical Deliverables</p>
                  {m.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      onClick={() => handleToggleMilestone(m.id, ms.id, ms.completed)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                        ms.completed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {ms.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-semibold ${ms.completed ? 'line-through opacity-80' : 'text-white'}`}>
                            {ms.title}
                          </h5>
                          <span className="text-[10px] text-slate-500 font-mono">Due: {ms.dueDate}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{ms.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organizational Skill Gaps Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="font-semibold text-white text-sm">Enterprise Skill Shortages & Training Demand</h3>
          <p className="text-xs text-slate-400">
            Skills identified with high project requirements vs available senior personnel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {skillGaps.map((gap, gIdx) => (
            <div key={gIdx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">{gap.skill}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  gap.urgency === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {gap.urgency}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                <p>Project Demand: <span className="text-white">{gap.mandatoryProjectDemand} mandatory roles</span></p>
                <p>Senior Specialists: <span className="text-indigo-400">{gap.seniorProficientCount} available</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function max(a: number, b: number) {
  return a > b ? a : b;
}
