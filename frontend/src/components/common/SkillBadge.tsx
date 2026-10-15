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
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium border transition-colors ${
        isVerified
          ? 'bg-black text-white border-black shadow-sm'
          : 'bg-zinc-100 text-zinc-800 border-zinc-200'
      } ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}
    >
      <span>{name}</span>
      {proficiency !== undefined && (
        <span className={`flex items-center text-[10px] font-mono ${isVerified ? 'text-zinc-300' : 'text-zinc-500'}`}>
          <Star className={`w-2.5 h-2.5 mr-0.5 ${isVerified ? 'text-white fill-current' : 'text-zinc-600 fill-current'}`} />
          {proficiency}/5
        </span>
      )}
      {isVerified && (
        <span title="Verified via GitHub / Project Assessment">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
        </span>
      )}
    </span>
  );
};
