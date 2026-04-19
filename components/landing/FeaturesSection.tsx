'use client';

import { Shield, Target, TrendingUp, Calendar, Zap, Users, Brain, MapPin } from 'lucide-react';

const features = [
  {
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/[0.08] border-emerald-500/[0.15]',
    title: 'Visa-Aware Matching',
    body: 'Every opportunity is filtered and ranked through the lens of your specific work authorization. F-1, OPT, CPT, STEM OPT — each has different constraints we handle natively.',
  },
  {
    icon: Calendar,
    color: 'text-blue-400',
    bg: 'bg-blue-500/[0.08] border-blue-500/[0.15]',
    title: 'CPT/OPT Timeline Intelligence',
    body: 'We understand your graduation date, OPT start window, STEM extension eligibility, and H-1B cap deadlines — and warn you when timing conflicts arise.',
  },
  {
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-500/[0.08] border-purple-500/[0.15]',
    title: 'Sponsorship History Database',
    body: 'We track which companies have actually sponsored H-1B visas, how often, and for which roles — so you apply where the historical evidence supports your chances.',
  },
  {
    icon: Target,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/[0.08] border-cyan-500/[0.15]',
    title: 'Priority Tiering',
    body: 'Every match is placed into a tier: Realistic, Stretch, or Low-Fit. Spend your energy where it matters most and stop wasting interviews on long shots.',
  },
  {
    icon: Brain,
    color: 'text-amber-400',
    bg: 'bg-amber-500/[0.08] border-amber-500/[0.15]',
    title: 'AI-Powered Strategy',
    body: 'Get a personalized action plan — not just a list. Claude AI synthesizes your profile, timing constraints, and market signals into concrete next steps.',
  },
  {
    icon: Zap,
    color: 'text-rose-400',
    bg: 'bg-rose-500/[0.08] border-rose-500/[0.15]',
    title: 'Real-Time Opportunity Signals',
    body: "Detect when companies are actively hiring, when their H-1B quota is filling up, and when to prioritize speed over perfection in your applications.",
  },
  {
    icon: MapPin,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/[0.08] border-indigo-500/[0.15]',
    title: 'Location + Remote Intelligence',
    body: 'Not all remote roles are work-authorization compatible. We surface location constraints that affect your OPT/CPT authorization and match you accordingly.',
  },
  {
    icon: Users,
    color: 'text-pink-400',
    bg: 'bg-pink-500/[0.08] border-pink-500/[0.15]',
    title: 'Peer Network Signals',
    body: 'See which companies are successfully hiring students from your program and university — and which offers have been accepted by peers in similar visa situations.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="section-pad relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] glow-orb-blue opacity-10" />

      <div className="relative z-10 container-max">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-purple-500/20 text-xs text-purple-400 font-medium mb-4">
            <Zap size={12} />
            Platform Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Everything Built for{' '}
            <span className="gradient-text">Your Situation</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Not just a job aggregator. A navigation system designed around the realities of international student career paths.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="glass-card rounded-2xl p-5 glass-card-hover group">
                <div className={`w-9 h-9 rounded-xl border ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={16} className={feature.color} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
