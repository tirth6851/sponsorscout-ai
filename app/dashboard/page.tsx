'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import OpportunityCard from '@/components/dashboard/OpportunityCard';
import FilterBar, { SortKey } from '@/components/dashboard/FilterBar';
import { FitTier } from '@/lib/types';
import {
  Target, TrendingUp, Shield, ArrowRight, Sparkles, AlertTriangle,
  RefreshCw, UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ── Skeleton loader ─────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl shimmer-line flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 shimmer-line rounded" />
          <div className="h-2 w-1/2 shimmer-line rounded" />
        </div>
        <div className="w-9 h-9 rounded-full shimmer-line flex-shrink-0" />
      </div>
      <div className="h-1.5 w-full shimmer-line rounded-full" />
      <div className="flex gap-1.5">
        <div className="h-5 w-16 shimmer-line rounded-full" />
        <div className="h-5 w-20 shimmer-line rounded-full" />
        <div className="h-5 w-12 shimmer-line rounded-full" />
      </div>
      <div className="h-2 w-full shimmer-line rounded" />
      <div className="h-2 w-2/3 shimmer-line rounded" />
    </div>
  );
}

// ── Legal disclaimer banner ──────────────────────────────────────────────────
function LegalBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/[0.14] mb-5">
      <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-400/90 leading-relaxed flex-1">
        <strong>Important:</strong> Sponsorship data is sourced from USCIS H-1B disclosures and is provided for
        strategic planning only. Match scores are algorithmic estimates, not guarantees. Always verify
        sponsorship policies directly with employers and consult a licensed immigration attorney.
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500/50 hover:text-amber-400 text-xs flex-shrink-0 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

// ── Stat cards ───────────────────────────────────────────────────────────────
function StatCards({ opps }: { opps: ScoredOpp[] }) {
  const realistic = opps.filter((o) => o.fit_tier === 'Realistic');
  const avgScore =
    opps.length > 0 ? Math.round(opps.reduce((a, b) => a + (b.match_score ?? 0), 0) / opps.length) : 0;
  const h1bCount = opps.filter((o) => o.h1bSponsor || o.h1b_sponsor).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total Matches', value: opps.length, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/[0.08]' },
        { label: 'Realistic Fits', value: realistic.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.08]' },
        { label: 'Avg Match Score', value: `${avgScore}%`, icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/[0.08]' },
        { label: 'H-1B Sponsors', value: h1bCount, icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/[0.08]' },
      ].map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="glass-card rounded-xl p-4">
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center mb-3', stat.bg)}>
              <Icon size={13} className={stat.color} />
            </div>
            <div className={cn('text-2xl font-bold mb-0.5', stat.color)}>{stat.value}</div>
            <div className="text-[11px] text-slate-500">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
interface ScoredOpp {
  id: string;
  title: string;
  company: string;
  companyInitials?: string;
  company_initials?: string;
  companyColor?: string;
  company_color?: string;
  location: string;
  remote: boolean;
  salaryRange?: string;
  salary_range?: string;
  match_score: number;
  matchScore?: number;
  fit_tier: FitTier | string;
  fitTier?: FitTier;
  sponsorshipStatus?: string;
  sponsorship_status?: string;
  cptCompatible?: boolean;
  cpt_compatible?: boolean;
  optCompatible?: boolean;
  opt_compatible?: boolean;
  h1bSponsor?: boolean;
  h1b_sponsor?: boolean;
  matchReasons?: string[];
  match_reasons?: string[];
  warningFlags?: string[];
  warning_flags?: string[];
  recommendedAction?: string;
  recommended_action?: string;
  postedDate?: string;
  posted_date?: string;
  industry?: string;
  experienceRequired?: string;
  experience_required?: string;
  skills: string[];
  description?: string;
  applicants?: number;
  demo?: boolean;
}

function normaliseOpp(o: ScoredOpp) {
  return {
    id: o.id,
    title: o.title,
    company: o.company,
    companyInitials: o.companyInitials ?? o.company_initials ?? o.company.slice(0, 2).toUpperCase(),
    companyColor: o.companyColor ?? o.company_color ?? '#3b82f6',
    location: o.location,
    remote: o.remote,
    salaryRange: o.salaryRange ?? o.salary_range ?? '',
    matchScore: o.match_score ?? o.matchScore ?? 0,
    fitTier: (o.fit_tier ?? o.fitTier ?? 'Low-Fit') as FitTier,
    sponsorshipStatus: (o.sponsorshipStatus ?? o.sponsorship_status ?? 'Unknown') as import('@/lib/types').SponsorshipStatus,
    cptCompatible: o.cptCompatible ?? o.cpt_compatible ?? false,
    optCompatible: o.optCompatible ?? o.opt_compatible ?? false,
    h1bSponsor: o.h1bSponsor ?? o.h1b_sponsor ?? false,
    matchReasons: o.matchReasons ?? o.match_reasons ?? [],
    warningFlags: o.warningFlags ?? o.warning_flags ?? [],
    recommendedAction: o.recommendedAction ?? o.recommended_action ?? '',
    postedDate: o.postedDate ?? o.posted_date ?? new Date().toISOString().split('T')[0],
    industry: o.industry ?? '',
    experienceRequired: (o.experienceRequired ?? o.experience_required ?? 'Entry Level') as import('@/lib/types').ExperienceLevel,
    skills: o.skills,
    description: o.description ?? '',
    applicants: o.applicants,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [opps, setOpps] = useState<ScoredOpp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FitTier | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('match');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/opportunities');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load opportunities');
        if (!cancelled) {
          setOpps(json.opportunities ?? []);
          setProfileMissing(!!json.profileMissing);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load opportunities');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let result = activeFilter === 'All' ? opps : opps.filter((o) => (o.fit_tier ?? o.fitTier) === activeFilter);
    if (sortKey === 'match') result = [...result].sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    else if (sortKey === 'date') result = [...result].sort((a, b) => new Date(b.posted_date ?? 0).getTime() - new Date(a.posted_date ?? 0).getTime());
    else if (sortKey === 'salary') result = [...result].sort((a, b) => {
      const parseMin = (s?: string) => parseInt((s ?? '').replace(/[^0-9]/g, '').slice(0, 3) ?? '0') || 0;
      return parseMin(b.salary_range ?? b.salaryRange) - parseMin(a.salary_range ?? a.salaryRange);
    });
    else if (sortKey === 'company') result = [...result].sort((a, b) => a.company.localeCompare(b.company));
    return result;
  }, [opps, activeFilter, sortKey]);

  const counts = useMemo(() => ({
    All: opps.length,
    Realistic: opps.filter((o) => (o.fit_tier ?? o.fitTier) === 'Realistic').length,
    Stretch: opps.filter((o) => (o.fit_tier ?? o.fitTier) === 'Stretch').length,
    'Low-Fit': opps.filter((o) => (o.fit_tier ?? o.fitTier) === 'Low-Fit').length,
  }), [opps]);

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] glow-orb-blue opacity-10 pointer-events-none" />

      <main className="flex-1 relative z-10 py-28">
        <div className="container-max">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1">Opportunity Matches</h1>
            <p className="text-sm text-slate-500">
              {loading ? 'Loading opportunities…' : `${opps.length} opportunities ranked by visa-aware match score`}
            </p>
          </div>

          <LegalBanner />

          {/* Profile missing prompt */}
          {profileMissing && !loading && (
            <div className="glass-card rounded-2xl p-5 mb-5 border border-blue-500/[0.12] flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <UserCircle size={18} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-0.5">Complete your profile to unlock match scores</p>
                <p className="text-xs text-slate-500">Opportunities are displayed without personalised scoring until you complete your profile.</p>
              </div>
              <Link href="/profile" className="btn-primary text-xs px-4 py-2 flex-shrink-0">
                Build Profile <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="glass-card rounded-2xl p-6 mb-5 border border-red-500/[0.15] flex items-start gap-3">
              <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Failed to load opportunities</p>
                <p className="text-xs text-slate-500 mb-3">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <RefreshCw size={11} /> Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass-card rounded-xl p-4 h-24 shimmer-line" />
                ))}
              </div>
              <div className="h-10 w-64 shimmer-line rounded-xl mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            </>
          )}

          {/* Loaded state */}
          {!loading && !error && opps.length > 0 && (
            <>
              <StatCards opps={opps} />

              {/* AI strategy link */}
              <div className="glass-card rounded-xl p-4 mb-5 border border-purple-500/[0.1] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">View your personalised career strategy</p>
                  <p className="text-xs text-slate-500">Action plan, timeline warnings, and skill gap analysis.</p>
                </div>
                <Link href="/strategy" className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
                  Strategy <ArrowRight size={11} />
                </Link>
              </div>

              <div className="mb-5">
                <FilterBar active={activeFilter} onChange={setActiveFilter} counts={counts} sort={sortKey} onSort={setSortKey} />
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-2xl">
                  <Target size={28} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No {activeFilter} matches.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={normaliseOpp(opp)} />
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !error && opps.length === 0 && (
            <div className="text-center py-20">
              <Target size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No opportunities found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
