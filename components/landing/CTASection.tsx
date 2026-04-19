'use client';

import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-700/20 to-dark-900" />

      <div className="relative z-10 container-max">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-glow-blue animate-float">
              <Compass size={24} className="text-white" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to Navigate{' '}
            <span className="gradient-text">Smarter?</span>
          </h2>

          <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto">
            Stop guessing. Build your profile in 3 minutes and get a visa-aware strategy built specifically for your situation.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="/profile" className="btn-primary px-8 py-3.5 text-base">
              Build Your Free Profile
              <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className="btn-ghost px-8 py-3.5 text-base">
              Explore Opportunities First
            </Link>
          </div>

          {/* Trust line */}
          <p className="text-xs text-slate-600">
            No account required · Visa data for strategic planning only · Always consult a licensed immigration attorney
          </p>

          {/* Floating glow */}
          <div className="mt-16 relative">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
