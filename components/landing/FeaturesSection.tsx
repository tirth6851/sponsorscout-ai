'use client';

import { Shield, Target, TrendingUp, Calendar, Zap, Cpu, Brain, MapPin } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    color: 'text-blue-400',
    bg: 'bg-blue-500/[0.08] border-blue-500/[0.15]',
    title: 'Engineering Discipline Matching',
    body: 'Match on your actual field — Software/CS, Data/AI/ML, Electrical, Mechanical, Civil, Industrial, or Research. Stop seeing irrelevant roles that waste your application time.',
  },
  {
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/[0.08] border-emerald-500/[0.15]',
    title: 'Visa-Aware Matching',
    body: 'Every opportunity is ranked through the lens of your specific work authorization. F-1 CPT, OPT, STEM OPT — each constraint is handled natively and matched against real job signals.',
  },
  {
    icon: Calendar,
    color: 'text-purple-400',
    bg: 'bg-purple-500/[0.08] border-purple-500/[0.15]',
    title: 'CPT/OPT Timeline Intelligence',
    body: 'We understand your graduation date, OPT start window, STEM extension eligibility, and H-1B cap deadlines — and warn you when timing conflicts with specific opportunities.',
  },
  {
    icon: TrendingUp,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/[0.08] border-cyan-500/[0.15]',
    title: 'Sponsorship Signal Detection',
    body: 'We scan job descriptions for risky phrases ("no sponsorship", "US citizens only") and positive signals ("visa sponsorship available", "accepts OPT") — so you apply where the evidence supports your chances.',
  },
  {
    icon: Target,
    color: 'text-amber-400',
    bg: 'bg-amber-500/[0.08] border-amber-500/[0.15]',
    title: 'Role Family Targeting',
    body: 'Specify whether you want internships, co-ops, research roles, campus jobs, or entry-level positions. We match on role type in addition to skills and discipline.',
  },
  {
    icon: Brain,
    color: 'text-rose-400',
    bg: 'bg-rose-500/[0.08] border-rose-500/[0.15]',
    title: 'Groq AI Strategy Layer',
    body: 'Get a personalized engineering career plan — not just a ranked list. Groq AI synthesizes your visa situation, discipline, matched companies, and timeline into concrete action steps.',
  },
  {
    icon: Zap,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/[0.08] border-indigo-500/[0.15]',
    title: 'Multi-Source Job Ingestion',
    body: 'Real jobs from Adzuna, Google Jobs (SerpApi), and USAJobs — normalized, deduplicated, and classified by engineering discipline before reaching your dashboard.',
  },
  {
    icon: MapPin,
    color: 'text-pink-400',
    bg: 'bg-pink-500/[0.08] border-pink-500/[0.15]',
    title: 'Location + Remote Intelligence',
    body: 'Not all remote roles are work-authorization compatible. We surface location constraints that affect your OPT/CPT authorization and match your preferred cities and states.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="section-pad relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] glow-orb-blue opacity-10" />

      <div className="relative z-10 container-max">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-purple-500/20 text-xs text-purple-400 font-medium mb-4">
            <Zap size={12} />
            Platform Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Built for{' '}
            <span className="gradient-text">International Engineering Students</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Not just a job aggregator. A navigation system designed around the realities of
            engineering students navigating US work authorization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-5 glass-card-hover group"
              >
                <div
                  className={`w-9 h-9 rounded-xl border ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon size={16} className={feature.color} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
