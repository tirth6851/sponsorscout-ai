import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SponsorScout AI — Visa-Aware Career Navigation',
  description: 'The only career navigator built for international students. Match with opportunities that understand your CPT/OPT timeline and sponsorship needs.',
  keywords: ['visa sponsorship', 'international students', 'CPT', 'OPT', 'H1-B', 'career navigation', 'job matching'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-dark-900 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
