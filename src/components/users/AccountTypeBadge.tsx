import { cn } from '@/lib/utils';

interface AccountTypeBadgeProps {
  type: 'personal' | 'business' | 'premium';
}

const typeStyles = {
  personal: 'bg-secondary text-secondary-foreground',
  business: 'bg-primary/10 text-primary',
  premium: 'gradient-gold text-accent-foreground',
};

export function AccountTypeBadge({ type }: AccountTypeBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium capitalize',
      typeStyles[type]
    )}>
      {type}
    </span>
  );
}
