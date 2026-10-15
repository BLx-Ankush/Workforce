import React, { useEffect, useState } from 'react';
import {
  FileText, ShieldCheck, ExternalLink, Printer,
  Sparkles, Award, CheckCircle2, Calendar, MapPin, Mail
} from 'lucide-react';
import { GithubIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { SkillBadge } from '../common/SkillBadge';

export const EmployeeProfile: React.FC = () => {
  const { employee } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const empId = employee?.id || 'emp_rahul';
      try {
        const res = await api.getEmployeeById(empId);
        setProfileData(res);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [employee]);

  const emp = profileData?.employee || employee;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Verified Professional Portfolio & Resume
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-synthesized from verified GitHub commits, supervisor audits, and completed enterprise assignments.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
        >
          <Printer className="w-4 h-4" />
          Export / Print Resume
        </button>
      </div>

      {/* Modern Printable Portfolio Paper Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl space-y-8 relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Resume Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-5">
            <img
              src={emp?.githubAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={emp?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{emp?.name || 'Rahul Sharma'}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Profile
                </span>
              </div>
              <p className="text-sm text-indigo-400 font-medium mt-0.5">{emp?.title || 'Senior Cloud Solutions Architect'}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {emp?.email}</span>
                <span>•</span>
                <span className="font-mono text-slate-300">ID: {emp?.employeeId}</span>
                <span>•</span>
                <span>{emp?.experienceYears} Years Demonstrated Experience</span>
              </div>
            </div>
          </div>

          {emp?.githubUsername && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <GithubIcon className="w-5 h-5 text-white" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">GitHub Verified</p>
                <a
                  href={`https://github.com/${emp.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  @{emp.githubUsername}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Professional Summary */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
            Executive Professional Summary
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            {emp?.portfolioSummary ||
              'Experienced technical lead specializing in cloud infrastructure, high-throughput distributed systems, and real-time streaming architectures. Proven track record across multi-region deployments with verified open-source contributions.'}
          </p>
        </div>

        {/* Verified Badges Section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            Verified Technical Badges & Certifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emp?.verifiedBadges?.map((badge: any, bIdx: number) => (
              <div key={bIdx} className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white text-xs">{badge.badgeName}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{badge.evidenceSource}</p>
                  <span className="text-[10px] text-emerald-400/80 font-mono mt-1 block">
                    Issued: {badge.issuedDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Demonstrated Skill Proficiencies
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(emp?.skills || {}).map(([sk, prof]: any) => (
              <SkillBadge
                key={sk}
                name={sk}
                proficiency={prof}
                isVerified={emp?.verifiedSkills?.includes(sk)}
                size="md"
              />
            ))}
          </div>
        </div>

        {/* Completed & Active Project Track Record */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Authoritative Enterprise Assignment History
          </h3>
          <div className="space-y-3">
            {profileData?.activeAssignments?.map((asgn: any, aIdx: number) => (
              <div key={aIdx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{asgn.roleName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                      {asgn.weeklyHours}h / week
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Project ID: {asgn.projectId}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  ACTIVE ASSIGNMENT
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
