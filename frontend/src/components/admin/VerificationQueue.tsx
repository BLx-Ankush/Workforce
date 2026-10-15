import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, Check, X, Code2, AlertTriangle, GitCommit,
  GitPullRequest, ExternalLink, RefreshCw
} from 'lucide-react';
import { api } from '../../api';
import { SkillEvidence } from '../../types';

export const VerificationQueue: React.FC = () => {
  const [items, setItems] = useState<SkillEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await api.getVerificationQueue();
      setItems(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleReview = async (id: string, decision: 'VERIFIED' | 'REJECTED') => {
    setReviewingId(id);
    try {
      await api.reviewEvidence(
        id,
        decision,
        decision === 'VERIFIED'
          ? 'Approved based on verified pull requests and multi-region deployment delivery.'
          : 'Insufficient repository evidence for stated proficiency.'
      );
      await fetchQueue();
    } catch (e: any) {
      alert(`Review error: ${e}`);
    } finally {
      setReviewingId(null);
    }
  };

  const pendingItems = items.filter(i => i.reviewStatus === 'PENDING_REVIEW' || i.reviewStatus === 'DETECTED');
  const verifiedItems = items.filter(i => i.reviewStatus === 'VERIFIED');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Evidence Governance Pipeline
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Technical Skill Verification Queue</h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
            Review candidate skill evidence synchronized from GitHub repositories.
            Approve verified badges to boost candidate ranking in the CP-SAT team optimizer.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Pending Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            Pending Review Items ({pendingItems.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Requires Admin Authorization</span>
        </div>

        <div className="space-y-3">
          {pendingItems.length === 0 ? (
            <div className="p-8 rounded-2xl glass-panel text-center text-xs text-slate-500">
              No pending skill evidence items awaiting review.
            </div>
          ) : (
            pendingItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{item.employeeName}</span>
                    <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {item.skillName} (Level {item.detectedProficiency}/5)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">{item.source}</span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-slate-400" />
                    {item.repositoryName} • Commit {item.commitHash || '8f3a9b'} • +{item.linesChanged || 450} lines
                  </p>

                  <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    "{item.evidenceSnippet}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReview(item.id, 'REJECTED')}
                    disabled={reviewingId === item.id}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => handleReview(item.id, 'VERIFIED')}
                    disabled={reviewingId === item.id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve & Issue Badge
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Verified Badges Issued */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Recently Verified Technical Badges ({verifiedItems.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {verifiedItems.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start justify-between text-xs">
              <div>
                <p className="font-bold text-white">{item.employeeName}</p>
                <p className="text-emerald-400 font-semibold">{item.skillName} Specialist Badge</p>
                <p className="text-[11px] text-slate-400 mt-1">{item.repositoryName}</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">● VERIFIED</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
