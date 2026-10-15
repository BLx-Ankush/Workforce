import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'rose' | 'amber' | 'indigo' | 'cyan';
  trend?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 rounded-2xl relative overflow-hidden glass-card-hover ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900">{value}</span>
            {badge && (
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-zinc-200 bg-zinc-100 text-zinc-800 font-semibold">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
          {trend && <p className="mt-2 text-xs font-medium text-zinc-800 flex items-center gap-1 font-mono">{trend}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
