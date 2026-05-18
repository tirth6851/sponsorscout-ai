'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Clock, Target, CheckCircle2, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

function HeroPreviewCard() {
  return (
    <div className="glass-card rounded-2xl p-5 w-full max-w-sm animate-float shadow-glow-blue">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0078d4] flex items-center justify-center text-xs font-bold text-white">
            MS
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              Software Engineer Intern
            </p>
            <p className="text-xs text-slate-400">Microsoft · Seattle, WA</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-400">94%</div>
          <div className="text-[10px] text-slate-500 leading-none">match</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-1.5 rounded-full bg-dark-500 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000"
            style={{ width: '94%' }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={10} /> H-1B Sponsor
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
          <CheckCircle2 size={10} /> CPT OK
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
          <Cpu size={10} /> Software/CS
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/[0.06] pt-3">
        8+ consecutive years of H-1B sponsorship. Internship role — CPT/OPT compatible. Your
        Python & TypeScript skills align strongly.
      </p>

      <div className="mt-3">
        <Badge variant="realistic">Realistic Match</Badge>
      </div>
    </div>
  );
}

function FloatingPill({
  icon,
  text,
  delay,
}: {
  icon: React.ReactNode;
  text: string;
  delay: string;
}) {
  return (
    <div
      className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/[0.1] text-xs text-slate-300 shadow-card animate-float"
      style={{ animationDelay: delay }}
    >
      {icon}
      {text}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-dark-900" />
      <div className="absolute inset-0 dot-grid opacity-60" />

      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] glow-orb-blue animate-glow opacity-40 -translate-y-1/3" />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] glow-orb-purple animate-glow opacity-30 translate-y-1/3"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/2 left-0 w-[300px] h-[300px] glow-orb-cyan animate-glow opacity-20"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-blue-500/20 text-xs text-blue-400 font-medium mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-slow" />
              Built for International Engineering Students · Powered by Groq AI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.07] tracking-tight text-white mb-6">
              Find Engineering Roles{' '}
              <span className="gradient-text block sm:inline">With Visa Intelligence</span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-xl mb-8">
              SponsorScout AI finds real internships, co-ops, research roles, and entry-level
              engineering opportunities — ranked by your CPT/OPT compatibility, sponsorship
              signals, and engineering discipline match.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/profile" className="btn-primary text-sm px-6 py-3">
                Build Your Engineering Profile
                <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard" className="btn-ghost text-sm px-6 py-3">
                Explore Opportunities
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-emerald-500" />
                <span>Visa-aware by design</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu size={15} className="text-blue-500" />
                <span>Engineering-specific matching</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-purple-500" />
                <span>CPT/OPT timeline alerts</span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <HeroPreviewCard />

              <div className="absolute -top-8 -left-12">
                <FloatingPill
                  icon={<Target size={12} className="text-blue-400" />}
                  text="94% engineering match"
                  delay="0s"
                />
              </div>
              <div className="absolute -bottom-6 -right-8">
                <FloatingPill
                  icon={<Shield size={12} className="text-emerald-400" />}
                  text="H-1B confirmed"
                  delay="1.5s"
                />
              </div>
              <div className="absolute top-1/2 -right-16">
                <FloatingPill
                  icon={<Clock size={12} className="text-amber-400" />}
                  text="CPT-safe internship"
                  delay="3s"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-slate-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
