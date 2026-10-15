import React from 'react';
import { AlertTriangle, CheckCircle2, Flame } from 'lucide-react';

interface WorkloadGaugeProps {
  score: number; // 0 - 100
  utilization?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const WorkloadGauge: React.FC<WorkloadGaugeProps> = ({
  score,
  utilization,
  size = 'md',
  showLabel = true,
}) => {
  const isOverloaded = score >= 90;
  const isWarning = score >= 70 && score < 90;
  const isHealthy = score < 70;

  const colorClass = isOverloaded
    ? 'text-rose-500 stroke-rose-500'
    : isWarning
    ? 'text-amber-500 stroke-amber-500'
    : 'text-emerald-500 stroke-emerald-500';

  const bgClass = isOverloaded
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    : isWarning
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  return (
    <div className="flex items-center gap-3">
      {/* Progress Ring / Gauge */}
      <div className="relative flex items-center justify-center">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="19"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-slate-800"
          />
          <circle
            cx="24"
            cy="24"
            r="19"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={119.38}
            strokeDashoffset={119.38 - (119.38 * Math.min(100, score)) / 100}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-500`}
          />
        </svg>
        <span className="absolute text-[11px] font-bold font-mono text-white">
          {score}
        </span>
      </div>

      {showLabel && (
        <div>
          <div className="flex items-center gap-1.5">
            {isOverloaded ? (
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${bgClass}`}>
                <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                BLOCKED (Risk {score}/100)
              </span>
            ) : isWarning ? (
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${bgClass}`}>
                <AlertTriangle className="w-3 h-3" />
                High Load ({score}/100)
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${bgClass}`}>
                <CheckCircle2 className="w-3 h-3" />
                Optimal ({score}/100)
              </span>
            )}
          </div>
          {utilization !== undefined && (
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Utilization: <span className="font-semibold text-slate-200">{utilization}%</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
