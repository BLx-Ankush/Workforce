import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, Check, X, Code2, AlertTriangle, GitCommit,
  GitPullRequest, ExternalLink, RefreshCw, HelpCircle
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

  const handleReview = async (id: string, decision: 'VERIFIED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE') => {
    setReviewingId(id);
    try {
      const note = decision === 'VERIFIED'
        ? 'Approved based on verified pull requests and multi-region deployment delivery.'
        : decision === 'REQUEST_MORE_EVIDENCE'
        ? 'Additional architectural commits or production pull request links requested for verification.'
        : 'Insufficient repository evidence for stated proficiency.';
      await api.reviewEvidence(id, decision, note);
      await fetchQueue();
    } catch (e: any) {
      alert(`Review error: ${e}`);
    } finally {
      setReviewingId(null);
    }
  };

  const pendingItems = items.filter(i => i.reviewStatus === 'PENDING_REVIEW' || i.reviewStatus === 'DETECTED' || i.reviewStatus === 'MORE_EVIDENCE_REQUESTED');
  const verifiedItems = items.filter(i => i.reviewStatus === 'VERIFIED');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 font-mono">
              Evidence Governance Pipeline
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Technical Skill Verification Queue</h2>
          <p className="text-xs text-zinc-600 max-w-xl mt-1 leading-relaxed">
            Review candidate skill evidence synchronized from GitHub repositories.
            Approve verified badges to boost candidate ranking in the CP-SAT team optimizer.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-300 text-xs font-semibold flex items-center gap-2 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-900" /> Refresh Queue
        </button>
      </div>

      {/* Pending Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
            Pending Review Items ({pendingItems.length})
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Requires Admin Authorization</span>
        </div>

        <div className="space-y-3">
          {pendingItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm text-center text-xs text-zinc-500">
              No pending skill evidence items awaiting review.
            </div>
          ) : (
            pendingItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-900 text-sm">{item.employeeName}</span>
                    <span className="text-xs font-bold text-zinc-900 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300">
                      {item.skillName} (Level {item.detectedProficiency}/5)
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">{item.source}</span>
                  </div>

                  <p className="text-xs text-zinc-600 font-mono flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-zinc-900" />
                    {item.repositoryName} • Commit {item.commitHash || '8f3a9b'} • +{item.linesChanged || 450} lines
                  </p>

                  <p className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200 leading-relaxed">
                    "{item.evidenceSnippet}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReview(item.id, 'REJECTED')}
                    disabled={reviewingId === item.id}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => handleReview(item.id, 'REQUEST_MORE_EVIDENCE')}
                    disabled={reviewingId === item.id}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-400 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-700" /> Request Evidence
                  </button>
                  <button
                    onClick={() => handleReview(item.id, 'VERIFIED')}
                    disabled={reviewingId === item.id}
                    className="px-4 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
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
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-900" />
          Recently Verified Technical Badges ({verifiedItems.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {verifiedItems.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start justify-between text-xs">
              <div>
                <p className="font-bold text-zinc-900">{item.employeeName}</p>
                <p className="text-zinc-900 font-semibold">{item.skillName} Specialist Badge</p>
                <p className="text-[11px] text-zinc-500 mt-1">{item.repositoryName}</p>
              </div>
              <span className="text-[10px] text-zinc-900 font-mono font-bold">● VERIFIED</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
