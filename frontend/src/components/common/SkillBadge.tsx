import React from 'react';
import { ShieldCheck, Star } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  proficiency?: number; // 1 - 5
  isVerified?: boolean;
  size?: 'sm' | 'md';
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  proficiency,
  isVerified = false,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border transition-colors ${
        isVerified
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
      } ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}
    >
      <span>{name}</span>
      {proficiency !== undefined && (
        <span className="flex items-center text-[10px] opacity-75 font-mono">
          <Star className="w-2.5 h-2.5 fill-current mr-0.5 text-amber-400" />
          {proficiency}/5
        </span>
      )}
      {isVerified && (
        <span title="Verified via GitHub / Project Assessment">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
        </span>
      )}
    </span>
  );
};
