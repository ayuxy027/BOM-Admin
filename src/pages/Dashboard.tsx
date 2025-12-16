import { Users, CreditCard, ArrowLeftRight, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UserGrowthChart } from '@/components/dashboard/UserGrowthChart';
import { TransactionChart } from '@/components/dashboard/TransactionChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { AccountTypesPie } from '@/components/dashboard/AccountTypesPie';
import { mockDashboardStats } from '@/data/mockData';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={mockDashboardStats.totalUsers.toLocaleString()}
          change={mockDashboardStats.userGrowth}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Active Users"
          value={mockDashboardStats.activeUsers.toLocaleString()}
          change={8.2}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Transactions"
          value={mockDashboardStats.totalTransactions.toLocaleString()}
          change={mockDashboardStats.transactionGrowth}
          icon={ArrowLeftRight}
          variant="default"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${(mockDashboardStats.totalRevenue / 1000).toFixed(0)}K`}
          change={15.3}
          icon={DollarSign}
          variant="accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart />
        <TransactionChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <AccountTypesPie />
      </div>
    </div>
  );
}
