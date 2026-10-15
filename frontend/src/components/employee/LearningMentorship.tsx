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
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 font-mono">
            Practical Mentorship Engine
          </span>
          <span className="text-xs text-zinc-500">Supervised Real-World Project Tracks</span>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Active Upskilling & Mentor Partnerships</h2>
        <p className="text-xs text-zinc-600 max-w-xl mt-1 leading-relaxed">
          Replaces passive video courses with hands-on, senior-supervised project deliverables.
          Complete practical milestones to earn verified badges.
        </p>
      </div>

      {/* Active Mentorships */}
      <div className="space-y-4">
        <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-zinc-900" />
          Active Supervised Mentorships ({mentorships.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mentorships.map((m) => {
            const completedCount = m.milestones.filter(ms => ms.completed).length;
            const progressPct = Math.round((completedCount / max(1, m.milestones.length)) * 100);

            return (
              <div key={m.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4 hover:border-zinc-300 transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Target Skill Mastery
                    </span>
                    <h4 className="font-bold text-zinc-900 text-lg">{m.targetSkill} Specialization</h4>
                    <p className="text-xs text-zinc-600 mt-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      Mentor: <strong className="text-zinc-900">{m.mentorName}</strong> ({m.weeklyHours}h/wk supervised)
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-black text-white font-semibold">
                    ● ACTIVE
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Deliverables Progress</span>
                    <span className="font-mono font-bold text-zinc-900">{completedCount}/{m.milestones.length} Completed ({progressPct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Milestones list */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Practical Deliverables</p>
                  {m.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      onClick={() => handleToggleMilestone(m.id, ms.id, ms.completed)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                        ms.completed
                          ? 'bg-zinc-50 border-zinc-300 text-zinc-800'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      {ms.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-semibold ${ms.completed ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                            {ms.title}
                          </h5>
                          <span className="text-[10px] text-zinc-500 font-mono">Due: {ms.dueDate}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{ms.description}</p>
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
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-zinc-900 text-sm">Enterprise Skill Shortages & Training Demand</h3>
          <p className="text-xs text-zinc-500">
            Skills identified with high project requirements vs available senior personnel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {skillGaps.map((gap, gIdx) => (
            <div key={gIdx} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-900 text-xs">{gap.skill}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  gap.urgency === 'CRITICAL'
                    ? 'bg-black text-white border-black'
                    : 'bg-zinc-200 text-zinc-800 border-zinc-300'
                }`}>
                  {gap.urgency}
                </span>
              </div>
              <div className="text-[11px] text-zinc-600 space-y-0.5 font-mono">
                <p>Project Demand: <span className="text-zinc-900 font-semibold">{gap.mandatoryProjectDemand} mandatory roles</span></p>
                <p>Senior Specialists: <span className="text-zinc-900 font-semibold">{gap.seniorProficientCount} available</span></p>
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
