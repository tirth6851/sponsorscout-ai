import { cn } from '@/lib/utils';
import { FitTier, SponsorshipStatus } from '@/lib/types';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'realistic' | 'stretch' | 'low' | 'blue' | 'cyan' | 'purple' | 'gray';
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-white/[0.08] text-slate-300 border-white/[0.1]',
    realistic: 'bg-emerald-500/[0.12] text-emerald-400 border-emerald-500/[0.2]',
    stretch: 'bg-amber-500/[0.12] text-amber-400 border-amber-500/[0.2]',
    low: 'bg-red-500/[0.1] text-red-400 border-red-500/[0.18]',
    blue: 'bg-blue-500/[0.12] text-blue-400 border-blue-500/[0.2]',
    cyan: 'bg-cyan-500/[0.12] text-cyan-400 border-cyan-500/[0.2]',
    purple: 'bg-purple-500/[0.12] text-purple-400 border-purple-500/[0.2]',
    gray: 'bg-slate-500/[0.1] text-slate-400 border-slate-500/[0.2]',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

export function FitBadge({ tier }: { tier: FitTier }) {
  const map: Record<FitTier, { variant: BadgeProps['variant']; dot: string }> = {
    'Realistic': { variant: 'realistic', dot: 'bg-emerald-400' },
    'Stretch': { variant: 'stretch', dot: 'bg-amber-400' },
    'Low-Fit': { variant: 'low', dot: 'bg-red-400' },
  };
  const { variant, dot } = map[tier];
  return (
    <Badge variant={variant}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
      {tier}
    </Badge>
  );
}

export function SponsorBadge({ status }: { status: SponsorshipStatus }) {
  const map: Record<SponsorshipStatus, BadgeProps['variant']> = {
    'Strong History': 'realistic',
    'Occasional': 'stretch',
    'Rare': 'low',
    'Unknown': 'gray',
  };
  return <Badge variant={map[status]}>{status}</Badge>;
}
