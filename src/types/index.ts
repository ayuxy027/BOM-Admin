export interface User {
  id: string; // from users.id
  account_number: string; // from users.account_number
  username: string; // from users.username
  mpin: string; // from users.mpin
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'; // from users.status
  created_at: string;

  // From user_details
  account_holder_name: string;
  account_type: 'SAVINGS' | 'CURRENT';
  balance: number;
  customer_id: string;
  email: string;
  mobile_number: string;
  address?: string;
  location?: string; // mapped to address
  lastLogin?: string; // specific logic needed

  // Extended Details
  mode_of_operation?: string;
  uncleared_balance?: number;
  amount_on_hold?: number;
  mmid?: string;
  monthly_average_balance?: number;
  account_open_date?: string;
  ifsc_code?: string;
  branch_name?: string;
  pan_number?: string;
  aadhar_number?: string;
  nominee_name?: string;
  relation_with_nominee?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  transaction_id: string;
  transaction_type: 'DEBIT' | 'CREDIT' | 'TRANSFER';
  amount: number;
  status: 'success' | 'pending' | 'failed' | 'reversed';
  description: string;
  transaction_date: string;
  beneficiary_name?: string;
  balance_after?: number;
  created_at?: string; // Optional or required, usually required from DB
}

export interface Beneficiary {
  id: string;
  user_id: string;
  beneficiary_id: string;
  beneficiary_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  nickname?: string;
  is_active: boolean;
  created_at?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  userGrowth: number;
  transactionGrowth: number;
}
