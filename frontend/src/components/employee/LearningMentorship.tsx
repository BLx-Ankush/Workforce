import React, { useEffect, useState } from 'react';
import {
  GraduationCap, CheckCircle2, Circle, Clock, User,
  ArrowRight, ShieldCheck, Award, Sparkles, BookOpen,
  Briefcase, Check, PlayCircle, ExternalLink, Video,
  UserCheck, Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Mentorship } from '../../types';
import { SkillBadge } from '../common/SkillBadge';

// Curated premier YouTube full courses for key engineering skills
const YOUTUBE_COURSES: Record<string, { title: string; url: string; channel: string; duration: string }> = {
  'AWS': {
    title: 'AWS Certified Solutions Architect & Cloud Practitioner Full Course',
    url: 'https://www.youtube.com/watch?v=SOTamWNgDKc',
    channel: 'freeCodeCamp.org',
    duration: '13 hours'
  },
  'Docker': {
    title: 'Docker Full Course for Beginners - Complete Containerization Tutorial',
    url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
    channel: 'freeCodeCamp.org',
    duration: '4 hours'
  },
  'Python': {
    title: 'Python for Beginners - Full Masterclass Tutorial',
    url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    channel: 'Programming with Mosh',
    duration: '6 hours'
  },
  'React': {
    title: 'React 18 & 19 Full Masterclass for Production Engineering',
    url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    channel: 'freeCodeCamp.org',
    duration: '11 hours'
  },
  'TypeScript': {
    title: 'TypeScript Full Course - Beginner to Advanced Production Code',
    url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs',
    channel: 'freeCodeCamp.org',
    duration: '5 hours'
  },
  'Data Analytics': {
    title: 'Data Analysis with Python Course - Hands-On Real-World Projects',
    url: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
    channel: 'freeCodeCamp.org',
    duration: '4 hours'
  },
  'Kubernetes': {
    title: 'Kubernetes Course for Beginners - Complete Cloud Orchestration',
    url: 'https://www.youtube.com/watch?v=X48VuDVv0do',
    channel: 'freeCodeCamp.org',
    duration: '4 hours'
  },
  'Machine Learning': {
    title: 'Machine Learning for Everybody - Full Comprehensive Course',
    url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
    channel: 'freeCodeCamp.org',
    duration: '4 hours'
  },
  'SQL': {
    title: 'SQL Tutorial - Full Database Course for Beginners',
    url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    channel: 'freeCodeCamp.org',
    duration: '4.5 hours'
  },
  'FastAPI': {
    title: 'FastAPI Course - Build Fast Asynchronous Python APIs',
    url: 'https://www.youtube.com/watch?v=0sOvCWFmrtA',
    channel: 'freeCodeCamp.org',
    duration: '19 hours'
  }
};

const SENIOR_MENTORS_FALLBACK: Record<string, { id: string; name: string; role: string; proficiency: number; experienceYears: number; isVerified: boolean }> = {
  'AWS': { id: 'emp_neha', name: 'Neha Gupta', role: 'Senior Cloud Solutions Architect', proficiency: 5, experienceYears: 7, isVerified: true },
  'Docker': { id: 'emp_vikram', name: 'Vikram Singh', role: 'Principal DevOps & Platform Engineer', proficiency: 5, experienceYears: 8, isVerified: true },
  'Python': { id: 'emp_meera', name: 'Meera Nair', role: 'Lead ML Scientist & Researcher', proficiency: 5, experienceYears: 9, isVerified: true },
  'React': { id: 'emp_anita', name: 'Anita Desai', role: 'Staff Frontend Architect', proficiency: 5, experienceYears: 7, isVerified: true },
  'TypeScript': { id: 'emp_anita', name: 'Anita Desai', role: 'Staff Frontend Architect', proficiency: 5, experienceYears: 7, isVerified: true },
  'Data Analytics': { id: 'emp_priya', name: 'Priya Patel', role: 'Lead Data Analytics Engineer', proficiency: 5, experienceYears: 6, isVerified: true },
  'Kubernetes': { id: 'emp_vikram', name: 'Vikram Singh', role: 'Principal DevOps Engineer', proficiency: 5, experienceYears: 8, isVerified: true },
  'Machine Learning': { id: 'emp_meera', name: 'Meera Nair', role: 'Lead ML Scientist', proficiency: 5, experienceYears: 9, isVerified: true },
  'SQL': { id: 'emp_priya', name: 'Priya Patel', role: 'Lead Data Platform Specialist', proficiency: 5, experienceYears: 6, isVerified: true },
  'FastAPI': { id: 'emp_priya', name: 'Priya Patel', role: 'Senior Backend Engineer', proficiency: 4, experienceYears: 6, isVerified: true }
};

export const LearningMentorship: React.FC = () => {
  const { employee } = useAuth();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingSkill, setEnrollingSkill] = useState<string | null>(null);

  const fetchMentorshipData = async () => {
    try {
      const [pairRes, gapRes] = await Promise.all([
        api.getMentorshipPairings(),
        api.getSkillGaps(),
      ]);
      setMentorships(pairRes);
      setSkillGaps(gapRes.slice(0, 6));
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

  const handleEnrollTrack = async (skill: string, preferredMentorId?: string) => {
    setEnrollingSkill(skill);
    try {
      const recs = await api.getMentorshipRecommendations(skill);
      const mentorId = preferredMentorId || recs?.availableMentors?.[0]?.id || 'emp_1';
      await api.createMentorship({
        mentorId,
        menteeId: employee?.id || 'emp_4',
        targetSkill: skill,
        weeklyHours: 4,
      });
      await fetchMentorshipData();
    } catch (err: any) {
      alert(`Enrollment error: ${err.message}`);
    } finally {
      setEnrollingSkill(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Flow 5 Step 1: Current Skills and Assigned Projects Profile */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 font-mono">
                Employee Growth Hub
              </span>
              <span className="text-xs text-zinc-500">Flow 5: Learning & Mentorship Pipeline</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Skill Profile & Supervised Project Learning
            </h2>
            <p className="text-xs text-zinc-600 mt-1">
              Practical project-based mentorship combined with premier video courses and senior peer guidance.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono bg-zinc-50 p-3 rounded-xl border border-zinc-200">
            <div>
              <span className="text-zinc-500 block text-[10px]">CURRENT LOAD</span>
              <span className="font-bold text-zinc-900">{employee?.allocatedHours || 0}h / {employee?.weeklyCapacityHours || 40}h</span>
            </div>
            <div className="h-6 w-px bg-zinc-200" />
            <div>
              <span className="text-zinc-500 block text-[10px]">ACTIVE PROJECTS</span>
              <span className="font-bold text-zinc-900">{employee?.activeAssignmentsCount || 1} Deliverables</span>
            </div>
          </div>
        </div>

        {/* Current Verified Skills List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-zinc-900" />
            My Current Technical Proficiencies
          </h4>
          <div className="flex flex-wrap gap-2">
            {employee && Object.entries(employee.skills || {}).map(([sk, prof]) => (
              <SkillBadge
                key={sk}
                name={sk}
                proficiency={prof}
                isVerified={employee.verifiedSkills?.includes(sk)}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Flow 5 Step 2 & 3: Analyzed Skill Shortages, Senior Person Cards & YouTube Course Videos */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-900" />
            Recommended Upskilling Paths (High Enterprise Demand)
          </h3>
          <p className="text-xs text-zinc-500">
            Watch related full course videos on YouTube and connect with a senior technical specialist for one-on-one project supervision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillGaps.map((gap, gIdx) => {
            const isAlreadyEnrolled = mentorships.some(m => m.targetSkill === gap.skill && m.status !== 'COMPLETED');
            const course = gap.course || YOUTUBE_COURSES[gap.skill] || {
              title: `${gap.skill} Professional Engineering Masterclass`,
              url: `https://www.youtube.com/results?search_query=${encodeURIComponent(gap.skill + ' full course tutorial')}`,
              channel: 'YouTube Technical Learning',
              duration: 'Comprehensive'
            };
            const senior = gap.seniorMentor || SENIOR_MENTORS_FALLBACK[gap.skill] || {
              id: 'emp_1',
              name: 'Marcus Vance',
              role: 'Staff Solutions Specialist',
              proficiency: 5,
              experienceYears: 8,
              isVerified: true
            };

            return (
              <div
                key={gIdx}
                className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4 hover:border-zinc-300 transition flex flex-col justify-between"
              >
                {/* Header & Urgency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 text-sm">{gap.skill}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                      gap.urgency === 'CRITICAL'
                        ? 'bg-black text-white border-black'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                    }`}>
                      {gap.urgency} DEMAND
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-500 flex items-center justify-between font-mono pb-2 border-b border-zinc-100">
                    <span>Project Need: <strong className="text-zinc-900">{gap.mandatoryProjectDemand} roles</strong></span>
                    <span>Holders: <strong className="text-zinc-900">{gap.totalQualifiedEmployees || 2}</strong></span>
                  </div>

                  {/* Senior Person Card */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-zinc-700" />
                      Senior Specialist in {gap.skill}
                    </span>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {senior.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        {senior.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5 text-black" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-bold text-zinc-900 text-xs truncate">{senior.name}</h5>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-900 font-bold shrink-0">
                            L{senior.proficiency}/5
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 truncate">{senior.role}</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {senior.experienceYears} yrs exp • Verified Mentor
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Course Video Link */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-1">
                      <Video className="w-3 h-3 text-zinc-700" />
                      Suggested Course Video
                    </span>
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 transition flex items-start gap-3 block"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:scale-105 transition-transform">
                        <PlayCircle className="w-4 h-4 fill-white text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
                            YouTube Course
                          </span>
                          <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-black transition" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-900 line-clamp-1 group-hover:underline mt-0.5">
                          {course.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {course.channel} • {course.duration}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Practical Deliverables & Mentorship Enrollment */}
                <div className="pt-2 border-t border-zinc-100">
                  {isAlreadyEnrolled ? (
                    <div className="text-xs font-bold text-zinc-900 bg-zinc-100 border border-zinc-200 py-2 px-3 rounded-xl text-center flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Enrolled in Supervised Track
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnrollTrack(gap.skill, senior.id)}
                      disabled={enrollingSkill === gap.skill}
                      className="w-full py-2 px-3 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {enrollingSkill === gap.skill ? 'Pairing Mentor...' : `Enroll & Pair with ${senior.name.split(' ')[0]}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flow 5 Step 4 & 5: Active Supervised Mentorships & Progress Tracker */}
      <div className="space-y-4">
        <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-zinc-900" />
          Active Supervised Mentorships ({mentorships.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mentorships.map((m) => {
            const completedCount = m.milestones.filter(ms => ms.completed).length;
            const progressPct = Math.round((completedCount / Math.max(1, m.milestones.length)) * 100);
            const isFinished = m.status === 'COMPLETED' || completedCount === m.milestones.length;

            return (
              <div key={m.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4 hover:border-zinc-300 transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Target Skill Track
                    </span>
                    <h4 className="font-bold text-zinc-900 text-lg">{m.targetSkill} Specialization</h4>
                    <p className="text-xs text-zinc-600 mt-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      Senior Mentor: <strong className="text-zinc-900">{m.mentorName}</strong> ({m.weeklyHours}h/wk supervised)
                    </p>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-md font-semibold ${
                    isFinished ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-black text-white'
                  }`}>
                    {isFinished ? '✓ COMPLETED' : '● ACTIVE'}
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
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Practical Deliverables (Click to Complete)</p>
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

      {/* Flow 5 Step 6 & 7: Verified Certificates & Credentials */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-zinc-900" />
            Verified Certificates & Practical Credentials
          </h3>
          <p className="text-xs text-zinc-500">
            Authoritative certifications awarded automatically upon completion of supervised mentorship deliverables and peer review.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {employee?.verifiedBadges && employee.verifiedBadges.length > 0 ? (
            employee.verifiedBadges.map((b, bIdx) => (
              <div key={bIdx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">{b.badgeName}</span>
                  <Award className="w-4 h-4 text-zinc-900" />
                </div>
                <p className="text-[11px] text-zinc-600 font-mono">Skill: {b.skill}</p>
                <p className="text-[10px] text-zinc-400">Awarded: {new Date(b.issuedDate).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 col-span-3 text-xs text-zinc-500 text-center py-6">
              Complete active mentorship milestones to earn verified enterprise mastery certificates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function max(a: number, b: number) {
  return a > b ? a : b;
}
