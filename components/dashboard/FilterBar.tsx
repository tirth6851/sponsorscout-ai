'use client';

import { FitTier } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SlidersHorizontal } from 'lucide-react';

const TIERS: { value: FitTier | 'All'; label: string; dot?: string }[] = [
  { value: 'All', label: 'All Matches' },
  { value: 'Realistic', label: 'Realistic', dot: 'bg-emerald-400' },
  { value: 'Stretch', label: 'Stretch', dot: 'bg-amber-400' },
  { value: 'Low-Fit', label: 'Low-Fit', dot: 'bg-red-400' },
];

export type SortKey = 'match' | 'date' | 'salary' | 'company';

interface FilterBarProps {
  active: FitTier | 'All';
  onChange: (tier: FitTier | 'All') => void;
  counts: Record<string, number>;
  sort: SortKey;
  onSort: (key: SortKey) => void;
}

export default function FilterBar({ active, onChange, counts, sort, onSort }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Tier filters */}
      <div className="flex items-center gap-1 p-1 glass-card rounded-xl">
        {TIERS.map((tier) => (
          <button
            key={tier.value}
            onClick={() => onChange(tier.value as FitTier | 'All')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              active === tier.value
                ? 'bg-white/[0.1] text-white shadow-inner'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {tier.dot && (
              <span className={cn('w-1.5 h-1.5 rounded-full', tier.dot)} />
            )}
            {tier.label}
            {counts[tier.value] !== undefined && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                active === tier.value ? 'bg-white/10 text-slate-300' : 'bg-white/[0.05] text-slate-600'
              )}>
                {counts[tier.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <select
          className="select-field text-xs py-1.5 pr-8 pl-3 w-auto cursor-pointer"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
        >
          <option value="match">Sort: Match Score</option>
          <option value="date">Sort: Date Posted</option>
          <option value="salary">Sort: Salary (High → Low)</option>
          <option value="company">Sort: Company A–Z</option>
        </select>
        <div className="flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-lg text-xs text-slate-500 cursor-default">
          <SlidersHorizontal size={12} />
          <span>
            {active === 'All' ? 'All tiers' : active}
          </span>
        </div>
      </div>
    </div>
  );
}
