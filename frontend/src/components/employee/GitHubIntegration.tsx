import React, { useEffect, useState } from 'react';
import {
  RefreshCw, CheckCircle2, ShieldCheck, AlertCircle,
  GitCommit, GitPullRequest, Code2, ExternalLink
} from 'lucide-react';
import { GithubIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { SkillEvidence } from '../../types';

export const GitHubIntegration: React.FC = () => {
  const { employee } = useAuth();
  const [username, setUsername] = useState(employee?.githubUsername || 'octocat-dev');
  const [evidences, setEvidences] = useState<SkillEvidence[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const fetchEvidences = async () => {
    const empId = employee?.id || 'emp_rahul';
    try {
      const res = await api.getEmployeeById(empId);
      setEvidences(res.skillEvidences || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvidences();
  }, [employee]);

  const handleSync = async () => {
    const empId = employee?.id || 'emp_rahul';
    setSyncing(true);
    try {
      const res = await api.syncGitHub(empId, username);
      setSyncResult(res);
      await fetchEvidences();
    } catch (err: any) {
      alert(`Sync error: ${err}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              Live GitHub Evidence Synchronizer
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Demo Sandbox Active</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">GitHub Technical Contribution Auditing</h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
            Synchronizes accessible repositories, commit patterns, and pull request deliverables.
            Detects candidate skill proficiencies and submits evidence to the Admin Verification Queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="GitHub handle..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-44 font-mono"
          />
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing Repos...' : 'Sync GitHub'}
          </button>
        </div>
      </div>

      {syncResult && (
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between">
          <span>
            ✅ Successfully synchronized @<strong>{syncResult.username}</strong>. Detected {syncResult.detectedItemsCount} candidate skill evidence items.
          </span>
          <span className="text-[10px] text-slate-400 font-mono uppercase">{syncResult.mode}</span>
        </div>
      )}

      {/* Evidence Items List */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">Extracted Skill Evidence Track</h3>
            <p className="text-xs text-slate-400">
              Evidence flows through: <strong>Detected</strong> &rarr; <strong>Pending Review</strong> &rarr; <strong>Verified Badge Awarded</strong>
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{evidences.length} Synchronized Items</span>
        </div>

        <div className="space-y-3">
          {evidences.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No evidence synchronized yet. Click "Sync GitHub" to pull repository commits.
            </div>
          ) : (
            evidences.map((item) => {
              const isVerified = item.reviewStatus === 'VERIFIED';
              const isRejected = item.reviewStatus === 'REJECTED';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.skillName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        Proficiency Level {item.detectedProficiency}/5
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        isVerified
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : isRejected
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.reviewStatus}
                      </span>
                    </div>

                    <p className="text-xs text-indigo-400 font-mono flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      {item.repositoryName}
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl pt-1">
                      "{item.evidenceSnippet}"
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {item.linesChanged && (
                      <span className="text-[11px] text-slate-400 font-mono block">
                        +{item.linesChanged} lines committed
                      </span>
                    )}
                    {isVerified ? (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-4 h-4" /> Badge Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Queued for Admin Review
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
