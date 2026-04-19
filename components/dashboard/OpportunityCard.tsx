'use client';

import { useState } from 'react';
import { MapPin, CheckCircle2, XCircle, ChevronDown, ChevronUp, ExternalLink, Users, AlertTriangle } from 'lucide-react';
import { Opportunity } from '@/lib/types';
import { FitBadge, SponsorBadge } from '@/components/ui/Badge';
import { MatchScore, MatchBar } from '@/components/dashboard/MatchScore';
import { cn } from '@/lib/utils';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity: opp }: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card rounded-2xl glass-card-hover overflow-hidden flex flex-col">
      {/* Top accent bar by tier */}
      <div className={cn(
        'h-0.5 w-full',
        opp.fitTier === 'Realistic' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' :
        opp.fitTier === 'Stretch' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
        'bg-gradient-to-r from-red-500 to-rose-700'
      )} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          {/* Company logo */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-card"
            style={{ backgroundColor: opp.companyColor }}
          >
            {opp.companyInitials}
          </div>

          {/* Title + company */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white leading-tight truncate">{opp.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{opp.company}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <MapPin size={10} />
              <span>{opp.location}{opp.remote ? ' · Remote' : ''}</span>
            </div>
          </div>

          {/* Match score */}
          <MatchScore score={opp.matchScore} size="sm" />
        </div>

        {/* Match bar */}
        <div className="mb-4">
          <MatchBar score={opp.matchScore} />
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <FitBadge tier={opp.fitTier} />
          <SponsorBadge status={opp.sponsorshipStatus} />
          {opp.cptCompatible && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/15">
              <CheckCircle2 size={9} /> CPT
            </span>
          )}
          {opp.optCompatible && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">
              <CheckCircle2 size={9} /> OPT
            </span>
          )}
          {!opp.cptCompatible && !opp.optCompatible && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/15">
              <XCircle size={9} /> Auth Issue
            </span>
          )}
        </div>

        {/* Salary */}
        {opp.salaryRange && (
          <div className="text-xs text-slate-400 mb-3">
            <span className="text-white font-medium">{opp.salaryRange}</span> · {opp.industry}
          </div>
        )}

        {/* Applicants */}
        {opp.applicants && (
          <div className="flex items-center gap-1 text-[10px] text-slate-600 mb-3">
            <Users size={9} />
            {opp.applicants.toLocaleString()} applicants
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200 mb-3"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Less detail' : 'Why this match?'}
        </button>

        {/* Expanded detail */}
        {expanded && (
          <div className="space-y-3 mb-4 animate-fade-in">
            {/* Match reasons */}
            {opp.matchReasons.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.1]">
                <p className="text-[10px] font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Why it fits</p>
                <ul className="space-y-1.5">
                  {opp.matchReasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                      <CheckCircle2 size={10} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warning flags */}
            {opp.warningFlags.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.1]">
                <p className="text-[10px] font-semibold text-amber-400 mb-2 uppercase tracking-wider">Watch out</p>
                <ul className="space-y-1.5">
                  {opp.warningFlags.map((flag) => (
                    <li key={flag} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                      <AlertTriangle size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended action */}
            <div className="p-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/[0.1]">
              <p className="text-[10px] font-semibold text-blue-400 mb-1 uppercase tracking-wider">Recommended action</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{opp.recommendedAction}</p>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/[0.05]">
          <button className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-glow-sm">
            Apply Now
          </button>
          <button className="p-2 rounded-lg glass border border-white/[0.08] text-slate-400 hover:text-white transition-colors duration-200">
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
