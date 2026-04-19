import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FitTier, SponsorshipStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fitTierClass(tier: FitTier): string {
  switch (tier) {
    case 'Realistic': return 'badge-realistic';
    case 'Stretch': return 'badge-stretch';
    case 'Low-Fit': return 'badge-low';
  }
}

export function fitTierDotColor(tier: FitTier): string {
  switch (tier) {
    case 'Realistic': return 'bg-emerald-400';
    case 'Stretch': return 'bg-amber-400';
    case 'Low-Fit': return 'bg-red-400';
  }
}

export function matchScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

export function matchScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent Fit';
  if (score >= 70) return 'Strong Fit';
  if (score >= 55) return 'Moderate Fit';
  return 'Low Fit';
}

export function sponsorBadgeClass(status: SponsorshipStatus): string {
  switch (status) {
    case 'Strong History': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'Occasional': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'Rare': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'Unknown': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return `${Math.floor(diff / 30)} months ago`;
}
