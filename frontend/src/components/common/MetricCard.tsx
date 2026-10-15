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
  badgeColor = 'indigo',
  trend,
  onClick,
}) => {
  const badgeStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  }[badgeColor];

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 rounded-xl relative overflow-hidden glass-card-hover ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
            {badge && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${badgeStyles}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          {trend && <p className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">{trend}</p>}
        </div>
        <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
    </div>
  );
};
