'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured. Running in demo mode.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient()!;
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={22} className="text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
        <p className="text-sm text-slate-400 mb-5">
          We sent a confirmation link to <span className="text-white font-medium">{email}</span>.
          Click it to activate your account, then sign in.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="btn-primary w-full justify-center py-2.5 text-sm"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
          <Compass size={17} className="text-white" />
        </div>
        <span className="font-bold text-white">SponsorScout <span className="gradient-text-blue">AI</span></span>
      </Link>

      <div className="glass-card rounded-2xl p-7">
        <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-sm text-slate-500 mb-6">Free to use. No credit card required.</p>

        {!isSupabaseConfigured() && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/[0.15] mb-5">
            <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-400 leading-relaxed">
              Demo mode — Supabase is not configured. Auth is disabled.{' '}
              <Link href="/profile" className="underline">Try the profile builder →</Link>
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/[0.15] mb-5">
            <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label-field">Confirm Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                className="input-field pl-9"
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured()}
            className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
