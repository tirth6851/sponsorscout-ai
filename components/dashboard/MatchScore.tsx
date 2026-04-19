import { matchScoreColor, matchScoreLabel } from '@/lib/utils';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function MatchScore({ score, size = 'md' }: MatchScoreProps) {
  const color = matchScoreColor(score);
  const label = matchScoreLabel(score);

  const sizeMap = {
    sm: { r: 14, cx: 18, strokeWidth: 2.5, viewBox: '0 0 36 36', textSize: 'text-xs', wh: 'w-9 h-9' },
    md: { r: 15.9, cx: 18, strokeWidth: 2, viewBox: '0 0 36 36', textSize: 'text-sm', wh: 'w-12 h-12' },
    lg: { r: 20, cx: 24, strokeWidth: 2, viewBox: '0 0 48 48', textSize: 'text-base', wh: 'w-16 h-16' },
  };

  const { r, cx, strokeWidth, viewBox, textSize, wh } = sizeMap[size];
  const circumference = 2 * Math.PI * r;
  const dashArray = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${wh} flex-shrink-0`}>
        <svg viewBox={viewBox} className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashArray} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold leading-none ${textSize}`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      {size !== 'sm' && (
        <span className="text-[10px] text-slate-500 text-center leading-tight">{label}</span>
      )}
    </div>
  );
}

export function MatchBar({ score }: { score: number }) {
  const color = matchScoreColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{score}%</span>
    </div>
  );
}
