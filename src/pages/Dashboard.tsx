import { Users, ArrowLeftRight } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { LoadingAnimation } from '@/components/ui/LoadingAnimation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Dashboard() {
  const { stats, loading, error } = useDashboardData();

  if (loading) return <LoadingAnimation />;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back! Here's what's happening today.">
      <div className="space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            change={stats.userGrowth}
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Transactions"
            value={stats.totalTransactions.toLocaleString()}
            change={stats.transactionGrowth}
            icon={ArrowLeftRight}
            variant="default"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
