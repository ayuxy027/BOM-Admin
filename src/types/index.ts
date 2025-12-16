export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  accountType: 'personal' | 'business' | 'premium';
  balance: number;
  createdAt: string;
  lastLogin: string;
  location: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: string;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  type: 'savings' | 'checking' | 'investment';
  balance: number;
  status: 'active' | 'frozen' | 'closed';
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  userGrowth: number;
  transactionGrowth: number;
}
