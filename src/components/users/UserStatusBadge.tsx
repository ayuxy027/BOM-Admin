import { cn } from '@/lib/utils';

interface UserStatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
  pending: 'bg-warning/10 text-warning border-warning/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
      statusStyles[status]
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        status === 'active' && 'bg-success',
        status === 'inactive' && 'bg-muted-foreground',
        status === 'pending' && 'bg-warning',
        status === 'suspended' && 'bg-destructive',
      )} />
      {status}
    </span>
  );
}
