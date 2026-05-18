export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 dot-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] glow-orb-blue opacity-10 pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
