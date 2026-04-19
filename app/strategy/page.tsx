'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { mockStrategy, mockOpportunities, mockProfile } from '@/lib/mock-data';
import { MatchScore } from '@/components/dashboard/MatchScore';
import { FitBadge } from '@/components/ui/Badge';
import {
  Sparkles, AlertTriangle, CheckCircle2, Info, TrendingUp,
  ChevronDown, ChevronUp, Calendar, Target, Zap, BookOpen, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

function InsightCard({ insight }: { insight: typeof mockStrategy.insights[0] }) {
  const iconMap = {
    success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.08] border-emerald-500/[0.12]' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/[0.08] border-amber-500/[0.12]' },
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/[0.08] border-blue-500/[0.12]' },
  };
  const { icon: Icon, color, bg } = iconMap[insight.type];

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

function ActionItem({ item, onToggle }: { item: typeof mockStrategy.actionPlan.thisWeek[0]; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 border',
        item.done
          ? 'border-emerald-500/[0.15] bg-emerald-500/[0.05]'
          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      )}
    >
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200',
        item.done ? 'border-emerald-500 bg-emerald-500' : 'border-white/20'
      )}>
        {item.done && <CheckCircle2 size={10} className="text-white" />}
      </div>
      <div className="flex-1">
        <p className={cn('text-sm font-medium leading-tight', item.done ? 'text-emerald-400 line-through opacity-70' : 'text-white')}>{item.label}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
      </div>
    </button>
  );
}

function ActionPlan() {
  const [items, setItems] = useState(mockStrategy.actionPlan);
  const [openSection, setOpenSection] = useState<string>('thisWeek');

  const sections = [
    { key: 'thisWeek', label: 'This Week', icon: Zap, color: 'text-blue-400' },
    { key: 'thisMonth', label: 'This Month', icon: Calendar, color: 'text-purple-400' },
    { key: 'threeMonths', label: 'Next 3 Months', icon: TrendingUp, color: 'text-cyan-400' },
  ] as const;

  const toggle = (section: keyof typeof items, idx: number) => {
    setItems(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === idx ? { ...item, done: !item.done } : item),
    }));
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <h3 className="text-base font-semibold text-white">Action Plan</h3>
        <p className="text-xs text-slate-500 mt-0.5">Your personalized roadmap — click items to mark complete</p>
      </div>

      {sections.map(({ key, label, icon: Icon, color }) => {
        const isOpen = openSection === key;
        const sectionItems = items[key];
        const doneCount = sectionItems.filter(i => i.done).length;

        return (
          <div key={key} className="border-b border-white/[0.05] last:border-0">
            <button
              onClick={() => setOpenSection(isOpen ? '' : key)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className={color} />
                <span className="text-sm font-medium text-white">{label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-500">
                  {doneCount}/{sectionItems.length} done
                </span>
              </div>
              {isOpen ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
            </button>

            {isOpen && (
              <div className="px-6 pb-5 space-y-2 animate-fade-in">
                {sectionItems.map((item, idx) => (
                  <ActionItem
                    key={idx}
                    item={item}
                    onToggle={() => toggle(key as keyof typeof items, idx)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkillGapCard({ gap }: { gap: typeof mockStrategy.skillGaps[0] }) {
  const importanceColor = {
    Critical: 'text-red-400 bg-red-500/10 border-red-500/15',
    High: 'text-amber-400 bg-amber-500/10 border-amber-500/15',
    Medium: 'text-blue-400 bg-blue-500/10 border-blue-500/15',
  }[gap.importance];

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-white">{gap.skill}</p>
        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold border', importanceColor)}>
          {gap.importance}
        </span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{gap.suggestion}</p>
    </div>
  );
}

export default function StrategyPage() {
  const topOpps = mockOpportunities.filter(o => o.fitTier === 'Realistic').slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />

      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] glow-orb-purple opacity-10 pointer-events-none" />

      <main className="flex-1 relative z-10 py-28">
        <div className="container-max">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-purple-500/20 text-xs text-purple-400 font-medium mb-4">
              <Sparkles size={12} />
              Powered by Claude AI
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {mockProfile.name.split(' ')[0]}&apos;s Career Strategy
            </h1>
            <p className="text-slate-400 text-sm">
              Personalized visa-aware roadmap for your {mockProfile.major} background and {mockProfile.currentVisa} status.
            </p>
          </div>

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
                      <p className="text-sm font-semibold text-white">AI Strategy Analysis</p>
                      <p className="text-[10px] text-slate-500">Generated by Claude AI · {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{mockStrategy.summary}</p>
                </div>
              </div>

              {/* Insights grid */}
              <div>
                <h2 className="text-base font-semibold text-white mb-4">Key Insights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockStrategy.insights.map(insight => (
                    <InsightCard key={insight.title} insight={insight} />
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <ActionPlan />

              {/* Timeline warnings */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-amber-400" />
                  <h2 className="text-base font-semibold text-white">Timeline Warnings</h2>
                </div>
                <div className="space-y-3">
                  {mockStrategy.timelineWarnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.1]">
                      <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-400 leading-relaxed">{warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Readiness */}
              <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
                <h3 className="text-sm font-semibold text-white mb-4">Profile Readiness</h3>
                <ReadinessMeter score={mockStrategy.overallReadiness} />
                <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                  Based on your visa status, graduation timing, skills alignment, and target company profiles.
                </p>
              </div>

              {/* Top matches */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-white">Priority Targets</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Realistic-tier companies to focus on</p>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {topOpps.map(opp => (
                    <div key={opp.id} className="px-5 py-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors duration-200">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: opp.companyColor }}
                      >
                        {opp.companyInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{opp.company}</p>
                        <p className="text-[10px] text-slate-500 truncate">{opp.title}</p>
                        <FitBadge tier={opp.fitTier} />
                      </div>
                      <div className="flex-shrink-0">
                        <MatchScore score={opp.matchScore} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-white/[0.06]">
                  <Link href="/dashboard" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                    View all matches <ArrowRight size={10} />
                  </Link>
                </div>
              </div>

              {/* Skill gaps */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={14} className="text-slate-400" />
                  <h3 className="text-sm font-semibold text-white">Skill Gaps to Close</h3>
                </div>
                <div className="space-y-3">
                  {mockStrategy.skillGaps.map(gap => (
                    <SkillGapCard key={gap.skill} gap={gap} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
