import { User, Transaction, DashboardStats } from '@/types';

export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@example.com', status: 'active', accountType: 'premium', balance: 125430.50, createdAt: '2024-01-15', lastLogin: '2024-12-15', location: 'New York, USA' },
  { id: '2', name: 'Michael Chen', email: 'm.chen@example.com', status: 'active', accountType: 'business', balance: 89250.00, createdAt: '2024-02-20', lastLogin: '2024-12-14', location: 'San Francisco, USA' },
  { id: '3', name: 'Emma Williams', email: 'emma.w@example.com', status: 'pending', accountType: 'personal', balance: 3420.75, createdAt: '2024-11-05', lastLogin: '2024-12-10', location: 'London, UK' },
  { id: '4', name: 'James Rodriguez', email: 'j.rodriguez@example.com', status: 'active', accountType: 'personal', balance: 15680.25, createdAt: '2024-03-12', lastLogin: '2024-12-15', location: 'Miami, USA' },
  { id: '5', name: 'Lisa Anderson', email: 'l.anderson@example.com', status: 'suspended', accountType: 'business', balance: 0, createdAt: '2024-01-28', lastLogin: '2024-11-20', location: 'Chicago, USA' },
  { id: '6', name: 'David Kim', email: 'd.kim@example.com', status: 'active', accountType: 'premium', balance: 245000.00, createdAt: '2023-08-15', lastLogin: '2024-12-15', location: 'Seoul, Korea' },
  { id: '7', name: 'Anna Martinez', email: 'a.martinez@example.com', status: 'active', accountType: 'personal', balance: 8750.50, createdAt: '2024-06-22', lastLogin: '2024-12-13', location: 'Madrid, Spain' },
  { id: '8', name: 'Robert Taylor', email: 'r.taylor@example.com', status: 'inactive', accountType: 'personal', balance: 1250.00, createdAt: '2024-04-10', lastLogin: '2024-10-05', location: 'Sydney, Australia' },
  { id: '9', name: 'Jennifer Brown', email: 'j.brown@example.com', status: 'active', accountType: 'business', balance: 67890.00, createdAt: '2024-02-14', lastLogin: '2024-12-14', location: 'Toronto, Canada' },
  { id: '10', name: 'Thomas Wilson', email: 't.wilson@example.com', status: 'pending', accountType: 'premium', balance: 50000.00, createdAt: '2024-12-01', lastLogin: '2024-12-12', location: 'Berlin, Germany' },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', userId: '1', type: 'credit', amount: 5000, status: 'completed', description: 'Wire Transfer In', date: '2024-12-15' },
  { id: 't2', userId: '2', type: 'debit', amount: 1250, status: 'completed', description: 'Payment to Vendor', date: '2024-12-15' },
  { id: 't3', userId: '1', type: 'transfer', amount: 3500, status: 'pending', description: 'Internal Transfer', date: '2024-12-14' },
  { id: 't4', userId: '6', type: 'credit', amount: 15000, status: 'completed', description: 'Investment Return', date: '2024-12-14' },
  { id: 't5', userId: '4', type: 'debit', amount: 450, status: 'failed', description: 'Card Payment', date: '2024-12-13' },
];

export const mockDashboardStats: DashboardStats = {
  totalUsers: 12458,
  activeUsers: 9823,
  totalTransactions: 89234,
  totalRevenue: 2456780,
  userGrowth: 12.5,
  transactionGrowth: 8.3,
};

export const chartData = {
  userGrowth: [
    { month: 'Jul', users: 8500 },
    { month: 'Aug', users: 9200 },
    { month: 'Sep', users: 9800 },
    { month: 'Oct', users: 10500 },
    { month: 'Nov', users: 11200 },
    { month: 'Dec', users: 12458 },
  ],
  transactions: [
    { month: 'Jul', amount: 185000 },
    { month: 'Aug', amount: 210000 },
    { month: 'Sep', amount: 195000 },
    { month: 'Oct', amount: 240000 },
    { month: 'Nov', amount: 275000 },
    { month: 'Dec', amount: 320000 },
  ],
  accountTypes: [
    { type: 'Personal', value: 65, fill: 'hsl(var(--chart-1))' },
    { type: 'Business', value: 25, fill: 'hsl(var(--chart-2))' },
    { type: 'Premium', value: 10, fill: 'hsl(var(--chart-3))' },
  ],
};
