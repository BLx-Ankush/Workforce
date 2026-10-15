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

  const strokeColor = isOverloaded
    ? 'text-black stroke-black stroke-[5]'
    : isWarning
    ? 'text-zinc-700 stroke-zinc-700'
    : 'text-zinc-900 stroke-zinc-900';

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
            strokeWidth="3.5"
            fill="transparent"
            className="text-zinc-100 stroke-zinc-200"
          />
          <circle
            cx="24"
            cy="24"
            r="19"
            stroke="currentColor"
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={119.38}
            strokeDashoffset={119.38 - (119.38 * Math.min(100, score)) / 100}
            strokeLinecap="round"
            className={`${strokeColor} transition-all duration-500`}
          />
        </svg>
        <span className="absolute text-[11px] font-extrabold font-mono text-zinc-900">
          {score}
        </span>
      </div>

      {showLabel && (
        <div>
          <div className="flex items-center gap-1.5">
            {isOverloaded ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-black text-white border border-black">
                <Flame className="w-3 h-3 text-white" />
                BLOCKED (Risk {score}/100)
              </span>
            ) : isWarning ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-zinc-200 text-zinc-900 border border-zinc-300">
                <AlertTriangle className="w-3 h-3 text-zinc-700" />
                High Load ({score}/100)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
                <CheckCircle2 className="w-3 h-3 text-zinc-700" />
                Optimal ({score}/100)
              </span>
            )}
          </div>
          {utilization !== undefined && (
            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
              Utilization: <span className="font-semibold text-zinc-900">{utilization}%</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
