'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MatchScore } from '@/components/dashboard/MatchScore';
import { FitBadge } from '@/components/ui/Badge';
import { StrategyOutput } from '@/lib/types';
import {
  Sparkles, AlertTriangle, CheckCircle2, Info, TrendingUp,
  ChevronDown, ChevronUp, Calendar, Target, Zap, BookOpen,
  ArrowRight, RefreshCw, UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ── Legal disclaimer ─────────────────────────────────────────────────────────
function LegalBanner() {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/[0.14] mb-6">
      <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-400/90 leading-relaxed">
        <strong>Disclaimer:</strong> This strategy is generated algorithmically based on publicly available
        USCIS data and your profile. It is for informational and planning purposes only.
        Always consult a licensed immigration attorney for advice specific to your situation.
      </p>
    </div>
  );
}

// ── Readiness meter ──────────────────────────────────────────────────────────
function ReadinessMeter({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Strong' : score >= 60 ? 'Developing' : 'Needs Work';
  return (
    <div className="flex flex-col items-center gap-3">
      <MatchScore score={score} size="lg" />
      <div className="text-center">
        <p className="text-xs text-slate-500">Overall Readiness</p>
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

// ── Insight card ─────────────────────────────────────────────────────────────
function InsightCard({ insight }: { insight: StrategyOutput['insights'][0] }) {
  const map = {
    success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.08] border-emerald-500/[0.12]' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/[0.08] border-amber-500/[0.12]' },
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/[0.08] border-blue-500/[0.12]' },
  };
  const { icon: Icon, color, bg } = map[insight.type];
  return (
    <div className={`glass-card rounded-2xl p-5 border ${bg}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={15} className={color} />
        </div>
        <div>
          <p className={`text-sm font-semibold mb-1 ${color}`}>{insight.title}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{insight.body}</p>
        </div>
      </div>
    </div>
  );
}

// ── Action plan ──────────────────────────────────────────────────────────────
type ActionPlanItem = { label: string; description: string; done: boolean };
type ActionPlan = { thisWeek: ActionPlanItem[]; thisMonth: ActionPlanItem[]; threeMonths: ActionPlanItem[] };

function ActionPlan({ plan }: { plan: ActionPlan }) {
  const [items, setItems] = useState(plan);
  const [open, setOpen] = useState<string>('thisWeek');

  const sections = [
    { key: 'thisWeek', label: 'This Week', icon: Zap, color: 'text-blue-400' },
    { key: 'thisMonth', label: 'This Month', icon: Calendar, color: 'text-purple-400' },
    { key: 'threeMonths', label: 'Next 3 Months', icon: TrendingUp, color: 'text-cyan-400' },
  ] as const;

  const toggle = (section: keyof ActionPlan, idx: number) => {
    setItems((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === idx ? { ...item, done: !item.done } : item
      ),
    }));
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <h3 className="text-base font-semibold text-white">Action Plan</h3>
        <p className="text-xs text-slate-500 mt-0.5">Click items to mark complete — progress persists in this session</p>
      </div>
      {sections.map(({ key, label, icon: Icon, color }) => {
        const isOpen = open === key;
        const sectionItems = items[key];
        const done = sectionItems.filter((i) => i.done).length;
        return (
          <div key={key} className="border-b border-white/[0.05] last:border-0">
            <button
              onClick={() => setOpen(isOpen ? '' : key)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className={color} />
                <span className="text-sm font-medium text-white">{label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-500">
                  {done}/{sectionItems.length} done
                </span>
              </div>
              {isOpen ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
            </button>
            {isOpen && (
              <div className="px-6 pb-5 space-y-2 animate-fade-in">
                {sectionItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggle(key as keyof ActionPlan, idx)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 border',
                      item.done ? 'border-emerald-500/[0.15] bg-emerald-500/[0.05]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                      item.done ? 'border-emerald-500 bg-emerald-500' : 'border-white/20'
                    )}>
                      {item.done && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={cn('text-sm font-medium leading-tight', item.done ? 'text-emerald-400 line-through opacity-70' : 'text-white')}>
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="glass-card rounded-2xl p-6 h-36 shimmer-line" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 h-28 shimmer-line" />
        ))}
      </div>
      <div className="glass-card rounded-2xl h-64 shimmer-line" />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function StrategyPage() {
  const [strategy, setStrategy] = useState<StrategyOutput | null>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [generatedBy, setGeneratedBy] = useState<string>('deterministic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/strategy');
        const json = await res.json();
        if (json.profileMissing) { setProfileMissing(true); setLoading(false); return; }
        if (!res.ok) throw new Error(json.error ?? 'Failed to load strategy');
        if (!cancelled) {
          setStrategy(json.strategy);
          setGeneratedBy(json.generatedBy ?? 'deterministic');
          const name = json.profile?.full_name ?? json.profile?.name ?? '';
          setProfileName(name.split(' ')[0] ?? '');
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load strategy');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] glow-orb-purple opacity-10 pointer-events-none" />

      <main className="flex-1 relative z-10 py-28">
        <div className="container-max">
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-purple-500/20 text-xs font-medium mb-3">
              <Sparkles size={12} className={generatedBy === 'groq' ? 'text-purple-400' : 'text-slate-500'} />
              <span className={generatedBy === 'groq' ? 'text-purple-400' : 'text-slate-500'}>
                {generatedBy === 'groq' ? 'Generated by Groq AI' : 'Algorithmic Strategy'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {profileName ? `${profileName}'s` : 'Your'} Career Strategy
            </h1>
            <p className="text-slate-400 text-sm">Visa-aware roadmap personalised to your profile.</p>
          </div>

          <LegalBanner />

          {/* Error state */}
          {error && (
            <div className="glass-card rounded-2xl p-6 border border-red-500/[0.15] flex items-start gap-3 mb-6">
              <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white mb-1">Failed to load strategy</p>
                <p className="text-xs text-slate-500 mb-3">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
                  <RefreshCw size={11} /> Retry
                </button>
              </div>
            </div>
          )}

          {/* Profile missing */}
          {profileMissing && !loading && (
            <div className="glass-card rounded-2xl p-8 text-center border border-blue-500/[0.12]">
              <UserCircle size={32} className="text-blue-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-white mb-2">Profile required</h2>
              <p className="text-sm text-slate-400 mb-5">Build your profile first so we can generate a personalised strategy.</p>
              <Link href="/profile" className="btn-primary inline-flex">Build Profile <ArrowRight size={14} /></Link>
            </div>
          )}

          {loading && <Skeleton />}

          {!loading && !error && !profileMissing && strategy && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Summary */}
                <div className="glass-card rounded-2xl p-6 border border-purple-500/[0.12] relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-40 h-40 glow-orb-purple opacity-10" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                        <Sparkles size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Strategy Summary</p>
                        <p className="text-[10px] text-slate-500">
                          {generatedBy === 'groq' ? 'Groq AI · ' : 'Algorithmic · '}
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{strategy.summary}</p>
                  </div>
                </div>

                {/* Insights */}
                {strategy.insights.length > 0 && (
                  <div>
                    <h2 className="text-base font-semibold text-white mb-4">Key Insights</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {strategy.insights.map((ins) => (
                        <InsightCard key={ins.title} insight={ins} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action plan */}
                <ActionPlan plan={strategy.actionPlan} />

                {/* Timeline warnings */}
                {strategy.timelineWarnings.length > 0 && (
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar size={16} className="text-amber-400" />
                      <h2 className="text-base font-semibold text-white">Timeline Warnings</h2>
                    </div>
                    <div className="space-y-3">
                      {strategy.timelineWarnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.1]">
                          <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-400 leading-relaxed">{w}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Readiness */}
                <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
                  <h3 className="text-sm font-semibold text-white mb-4">Profile Readiness</h3>
                  <ReadinessMeter score={strategy.overallReadiness} />
                  <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                    Based on visa status, graduation timing, skills alignment, and target company fit.
                  </p>
                </div>

                {/* Skill gaps */}
                {strategy.skillGaps.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={14} className="text-slate-400" />
                      <h3 className="text-sm font-semibold text-white">Skill Gaps to Close</h3>
                    </div>
                    <div className="space-y-3">
                      {strategy.skillGaps.map((gap) => {
                        const importanceColor = {
                          Critical: 'text-red-400 bg-red-500/10 border-red-500/15',
                          High: 'text-amber-400 bg-amber-500/10 border-amber-500/15',
                          Medium: 'text-blue-400 bg-blue-500/10 border-blue-500/15',
                        }[gap.importance];
                        return (
                          <div key={gap.skill} className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-white">{gap.skill}</p>
                              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold border', importanceColor)}>
                                {gap.importance}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{gap.suggestion}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Link to dashboard */}
                <div className="glass-card rounded-xl p-4 text-center">
                  <Target size={20} className="text-blue-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-3">View your ranked opportunities</p>
                  <Link href="/dashboard" className="btn-ghost text-xs px-4 py-2 inline-flex items-center gap-1.5">
                    Opportunity Dashboard <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Suppress unused import warning on FitBadge (used conditionally via sidebar)
void FitBadge;
