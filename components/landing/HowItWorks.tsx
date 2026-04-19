'use client';

import Link from 'next/link';
import { UserCircle, Search, Rocket, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserCircle,
    color: 'from-blue-500 to-blue-600',
    glowColor: 'shadow-glow-blue',
    borderColor: 'border-blue-500/20',
    title: 'Build Your Profile',
    body: 'Tell us your major, graduation date, current visa status, desired roles, location preferences, and sponsorship needs. Takes 3 minutes.',
    detail: 'We capture what job boards ignore: your CPT/OPT window, STEM eligibility, and specific work authorization constraints.',
    cta: { href: '/profile', label: 'Start Profile' },
  },
  {
    number: '02',
    icon: Search,
    color: 'from-purple-500 to-purple-600',
    glowColor: 'shadow-glow-purple',
    borderColor: 'border-purple-500/20',
    title: 'Get Visa-Aware Matches',
    body: "Claude AI analyzes your profile against thousands of opportunities — cross-referencing each company's sponsorship history, the role's authorization compatibility, and your timing window.",
    detail: 'Every result comes with a match score, fit tier, and clear explanation of why it does or doesn\'t work for your situation.',
    cta: { href: '/dashboard', label: 'See Matches' },
  },
  {
    number: '03',
    icon: Rocket,
    color: 'from-cyan-500 to-cyan-600',
    glowColor: 'shadow-glow-cyan',
    borderColor: 'border-cyan-500/20',
    title: 'Execute Your Strategy',
    body: "Get a personalized 30/60/90-day action plan — not just a list. Know exactly which companies to prioritize, which skills to close, and when to act given your immigration timeline.",
    detail: 'Timeline warnings, skill gap analysis, and networking recommendations all calibrated to your specific visa situation.',
    cta: { href: '/strategy', label: 'View Strategy' },
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 bg-dark-800/30" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] glow-orb-purple opacity-10" />

      <div className="relative z-10 container-max">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-cyan-500/20 text-xs text-cyan-400 font-medium mb-4">
            <Rocket size={12} />
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            From Profile to{' '}
            <span className="gradient-text">Winning Strategy</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Three intentional steps that transform how you approach your international student job search.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {/* Connector line on desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(100%+16px)] w-8 h-px bg-gradient-to-r from-white/10 to-transparent z-10" />
                )}

                <div className={`glass-card rounded-2xl p-7 border ${step.borderColor} glass-card-hover h-full`}>
                  {/* Step number + icon */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center ${step.glowColor} flex-shrink-0`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-3xl font-black text-white/10">{step.number}</span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{step.body}</p>

                  {/* Detail */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5">
                    <p className="text-xs text-slate-500 leading-relaxed">{step.detail}</p>
                  </div>

                  {/* CTA */}
                  <Link
                    href={step.cta.href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200 group"
                  >
                    {step.cta.label}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
