'use client';

import { AlertTriangle, Shuffle, Clock, HelpCircle } from 'lucide-react';

const painPoints = [
  {
    icon: Shuffle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/[0.08]',
    borderColor: 'border-red-500/[0.12]',
    title: 'Applying Blindly',
    body: 'Most job boards show all open roles regardless of work authorization. International students waste months applying to companies that have never sponsored a visa.',
    stat: '73%',
    statLabel: 'of students apply to non-sponsoring companies',
  },
  {
    icon: Clock,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/[0.08]',
    borderColor: 'border-amber-500/[0.12]',
    title: 'Timing Nightmares',
    body: "CPT windows, OPT start dates, STEM extensions, and H-1B cap seasons interact in complex ways that generic job boards don't understand or surface.",
    stat: '6 months',
    statLabel: 'average time wasted on poor-fit applications',
  },
  {
    icon: HelpCircle,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/[0.08]',
    borderColor: 'border-purple-500/[0.12]',
    title: 'No Strategic Guidance',
    body: "LinkedIn and Indeed don't distinguish between employers who actively sponsor and those who don't. There's no prioritization, no timeline context, no strategy.",
    stat: '3x',
    statLabel: 'more likely to land interviews with visa-aware targeting',
  },
];

export default function ProblemSection() {
  return (
    <section id="why-it-matters" className="section-pad relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-dark-800/40" />
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="relative z-10 container-max">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-red-500/20 text-xs text-red-400 font-medium mb-4">
            <AlertTriangle size={12} />
            The Real Problem
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Why Normal Job Boards{' '}
            <span className="gradient-text-warm">Fail International Students</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            The gap isn't just inconvenience — it's systemic. Standard platforms weren't built with your constraints in mind.
          </p>
        </div>

        {/* Pain points grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {painPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className={`glass-card rounded-2xl p-6 border ${point.borderColor} glass-card-hover`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${point.bgColor} border ${point.borderColor} flex items-center justify-center mb-5`}>
                  <Icon size={18} className={point.color} />
                </div>

                {/* Stat */}
                <div className={`text-3xl font-bold ${point.color} mb-1`}>{point.stat}</div>
                <p className="text-xs text-slate-500 mb-4">{point.statLabel}</p>

                {/* Content */}
                <h3 className="text-base font-semibold text-white mb-2">{point.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{point.body}</p>
              </div>
            );
          })}
        </div>

        {/* Divider quote */}
        <div className="mt-16 glass-card rounded-2xl p-8 border border-blue-500/[0.1] text-center">
          <blockquote className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            &ldquo;International students spend an average of <span className="text-white font-semibold">6 months applying to roles</span> that were never realistic matches — not due to lack of skill, but due to{' '}
            <span className="gradient-text font-semibold">lack of sponsorship intelligence.</span>&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
