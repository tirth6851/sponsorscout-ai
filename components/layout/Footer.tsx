import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-white text-sm">SponsorScout</span>
                <span className="text-xs font-semibold gradient-text-blue">AI</span>
              </div>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              The only career navigator built specifically for international students navigating visa constraints and sponsorship needs.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-1 text-xs rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                Built with Opus 4.7
              </span>
              <span className="px-2 py-1 text-xs rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                Hackathon 2025
              </span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/profile', label: 'Build Profile' },
                { href: '/dashboard', label: 'Opportunities' },
                { href: '/strategy', label: 'My Strategy' },
                { href: '/#features', label: 'Features' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">For Students</h4>
            <ul className="space-y-2.5">
              {[
                { href: '#', label: 'CPT/OPT Guide' },
                { href: '#', label: 'H-1B Timeline' },
                { href: '#', label: 'Sponsorship Database' },
                { href: '#', label: 'Immigration FAQ' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© 2025 SponsorScout AI. Built for the Built with Opus 4.7 Hackathon.</p>
          <p className="text-xs text-slate-600">Visa data is approximate and for strategic planning only. Always consult a licensed immigration attorney.</p>
        </div>
      </div>
    </footer>
  );
}
