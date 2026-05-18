'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass, Mail, Lock, AlertCircle } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured. Running in demo mode — visit /dashboard directly.');
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient()!;
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.push(next);
      router.refresh();
    }
  };

  return (
    <div>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
          <Compass size={17} className="text-white" />
        </div>
        <span className="font-bold text-white">SponsorScout <span className="gradient-text-blue">AI</span></span>
      </Link>

      {/* Card */}
      <div className="glass-card rounded-2xl p-7">
        <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to access your career strategy.</p>

        {!isSupabaseConfigured() && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/[0.15] mb-5">
            <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-400 leading-relaxed">
              Demo mode — Supabase is not configured. Auth is disabled.{' '}
              <Link href="/dashboard" className="underline">Go to demo dashboard →</Link>
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/[0.15] mb-5">
            <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-400 leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                className="input-field pl-9"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label-field">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                className="input-field pl-9"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured()}
            className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-5">
          No account?{' '}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
            Create one free →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="glass-card rounded-2xl p-7 animate-pulse h-64" />}>
      <LoginForm />
    </Suspense>
  );
}
