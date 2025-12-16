import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';
import { mockTransactions, mockUsers } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function RecentActivity() {
  const getUser = (userId: string) => mockUsers.find(u => u.id === userId);

  const getIcon = (type: string) => {
    switch (type) {
      case 'credit': return ArrowDownRight;
      case 'debit': return ArrowUpRight;
      default: return ArrowLeftRight;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'failed': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest transactions across all users</p>
      </div>
      <div className="space-y-4">
        {mockTransactions.slice(0, 5).map((transaction) => {
          const user = getUser(transaction.userId);
          const Icon = getIcon(transaction.type);
          
          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  transaction.type === 'credit' ? 'bg-success/10 text-success' :
                  transaction.type === 'debit' ? 'bg-destructive/10 text-destructive' :
                  'bg-primary/10 text-primary'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground text-sm">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{user?.name} • {transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  'font-semibold text-sm',
                  transaction.type === 'credit' ? 'text-success' : 'text-card-foreground'
                )}>
                  {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </p>
                <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', getStatusColor(transaction.status))}>
                  {transaction.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
