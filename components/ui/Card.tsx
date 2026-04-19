import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'blue' | 'purple' | 'cyan' | 'none';
}

export function Card({ children, className, hover = false, glow = 'none' }: CardProps) {
  const glowMap = {
    blue: 'hover:shadow-glow-blue',
    purple: 'hover:shadow-glow-purple',
    cyan: 'hover:shadow-glow-cyan',
    none: '',
  };

  return (
    <div className={cn(
      'glass-card rounded-2xl',
      hover && 'glass-card-hover cursor-pointer',
      glow !== 'none' && glowMap[glow],
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 pt-6 pb-4', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 pb-6', className)}>
      {children}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('border-t border-white/[0.06]', className)} />;
}
