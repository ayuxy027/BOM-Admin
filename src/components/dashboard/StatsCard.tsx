import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'accent';
}

export function StatsCard({ title, value, change, icon: Icon, variant = 'default' }: StatsCardProps) {
  const isPositive = change && change > 0;

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-card-foreground">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded',
                  isPositive 
                    ? 'text-success bg-success/10' 
                    : 'text-destructive bg-destructive/10'
                )}
              >
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            variant === 'primary' && 'bg-primary/10 text-primary',
            variant === 'accent' && 'gradient-gold text-accent-foreground',
            variant === 'default' && 'bg-secondary text-secondary-foreground'
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
