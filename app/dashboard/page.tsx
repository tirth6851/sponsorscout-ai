'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import OpportunityCard from '@/components/dashboard/OpportunityCard';
import FilterBar from '@/components/dashboard/FilterBar';
import { MatchScore } from '@/components/dashboard/MatchScore';
import { mockOpportunities, mockProfile } from '@/lib/mock-data';
import { FitTier } from '@/lib/types';
import { Target, TrendingUp, Shield, ArrowRight, GraduationCap, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

function ProfileBanner() {
  return (
    <div className="glass-card rounded-2xl p-5 mb-6 border border-blue-500/[0.1]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {mockProfile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{mockProfile.name}</p>
            <p className="text-xs text-slate-500">{mockProfile.major} · {mockProfile.school}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                <GraduationCap size={10} /> Graduating {new Date(mockProfile.graduationDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                <MapPin size={10} /> {mockProfile.preferredLocations[0]}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-medium">
                {mockProfile.currentVisa}
              </span>
              {mockProfile.stemEligible && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/15 font-medium">
                  STEM OPT Eligible
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/strategy" className="btn-primary text-xs px-4 py-2">
            View Strategy <ArrowRight size={12} />
          </Link>
          <Link href="/profile" className="btn-ghost text-xs px-4 py-2">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCards({ opps }: { opps: typeof mockOpportunities }) {
  const realistic = opps.filter(o => o.fitTier === 'Realistic');
  const avgScore = Math.round(opps.reduce((a, b) => a + b.matchScore, 0) / opps.length);
  const h1bCount = opps.filter(o => o.h1bSponsor).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total Matches', value: opps.length, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/[0.08]' },
        { label: 'Realistic Fits', value: realistic.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.08]' },
        { label: 'Avg Match Score', value: `${avgScore}%`, icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/[0.08]' },
        { label: 'H-1B Sponsors', value: h1bCount, icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/[0.08]' },
      ].map(stat => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="glass-card rounded-xl p-4">
            <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <Icon size={13} className={stat.color} />
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-0.5`}>{stat.value}</div>
            <div className="text-[11px] text-slate-500">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function AiSummaryBanner() {
  return (
    <div className="glass-card rounded-2xl p-5 mb-6 border border-purple-500/[0.12] relative overflow-hidden">
      <div className="absolute right-0 top-0 w-40 h-40 glow-orb-purple opacity-10" />
      <div className="relative z-10 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-white">AI Strategy Summary</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 font-medium">Claude AI</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your STEM OPT eligibility is a major strategic advantage — it gives you a <strong className="text-white">3-year work authorization runway</strong>. Focus your energy on Microsoft, Google, Stripe, and Nvidia (your 4 Realistic-tier matches). Avoid Palantir — citizenship requirements disqualify international students.
          </p>
          <Link href="/strategy" className="inline-flex items-center gap-1 mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors">
            See full strategy <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<FitTier | 'All'>('All');

  const filteredOpps = useMemo(() => {
    if (activeFilter === 'All') return mockOpportunities;
    return mockOpportunities.filter(o => o.fitTier === activeFilter);
  }, [activeFilter]);

  const counts = useMemo(() => {
    return {
      All: mockOpportunities.length,
      Realistic: mockOpportunities.filter(o => o.fitTier === 'Realistic').length,
      Stretch: mockOpportunities.filter(o => o.fitTier === 'Stretch').length,
      'Low-Fit': mockOpportunities.filter(o => o.fitTier === 'Low-Fit').length,
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />

      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] glow-orb-blue opacity-10 pointer-events-none" />

      <main className="flex-1 relative z-10 py-28">
        <div className="container-max">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Opportunity Matches</h1>
            <p className="text-sm text-slate-500">
              {mockOpportunities.length} opportunities ranked by visa-aware match score for your profile
            </p>
          </div>

          <ProfileBanner />
          <StatCards opps={mockOpportunities} />
          <AiSummaryBanner />

          {/* Filter bar */}
          <div className="mb-6">
            <FilterBar active={activeFilter} onChange={setActiveFilter} counts={counts} />
          </div>

          {/* Results grid */}
          {filteredOpps.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <Target size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No matches for this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredOpps.map(opp => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
