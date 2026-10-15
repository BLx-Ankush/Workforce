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
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-900" />
            Verified Professional Portfolio & Resume
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Auto-synthesized from verified GitHub commits, supervisor audits, and completed enterprise assignments.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-300 text-xs font-semibold flex items-center gap-2 transition shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Export / Print Resume
        </button>
      </div>

      {/* Modern Printable Portfolio Paper Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-4xl mx-auto shadow-sm space-y-8 relative overflow-hidden">
        {/* Resume Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200">
          <div className="flex items-center gap-5">
            <img
              src={emp?.githubAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={emp?.name}
              className="w-20 h-20 rounded-2xl object-cover border border-zinc-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{emp?.name || 'Rahul Sharma'}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-zinc-900" /> Verified Profile
                </span>
              </div>
              <p className="text-sm text-zinc-600 font-medium mt-0.5">{emp?.title || 'Senior Cloud Solutions Architect'}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-2">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {emp?.email}</span>
                <span>•</span>
                <span className="font-mono text-zinc-700">ID: {emp?.employeeId}</span>
                <span>•</span>
                <span>{emp?.experienceYears} Years Demonstrated Experience</span>
              </div>
            </div>
          </div>

          {emp?.githubUsername && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
              <GithubIcon className="w-5 h-5 text-zinc-900" />
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">GitHub Verified</p>
                <a
                  href={`https://github.com/${emp.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-zinc-900 hover:underline flex items-center gap-1"
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
            Executive Professional Summary
          </h3>
          <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            {emp?.portfolioSummary ||
              'Experienced technical lead specializing in cloud infrastructure, high-throughput distributed systems, and real-time streaming architectures. Proven track record across multi-region deployments with verified open-source contributions.'}
          </p>
        </div>

        {/* Verified Badges Section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-zinc-900" />
            Verified Technical Badges & Certifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emp?.verifiedBadges?.map((badge: any, bIdx: number) => (
              <div key={bIdx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-zinc-900 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-zinc-900 text-xs">{badge.badgeName}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{badge.evidenceSource}</p>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                    Issued: {badge.issuedDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">
            Authoritative Enterprise Assignment History
          </h3>
          <div className="space-y-3">
            {profileData?.activeAssignments?.map((asgn: any, aIdx: number) => (
              <div key={aIdx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900">{asgn.roleName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 font-mono">
                      {asgn.weeklyHours}h / week
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">Project ID: {asgn.projectId}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded bg-black text-white font-bold">
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
