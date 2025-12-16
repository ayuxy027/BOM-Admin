-- Banking Application - Complete Database Schema
-- This file includes all tables and relationships for the Mahamobile Plus Banking Application

-- First, create the common trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Users table - Core user information
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Personal Information
  account_holder_name TEXT NOT NULL,
  customer_id TEXT UNIQUE,
  date_of_birth DATE,
  address TEXT,
  pan_number TEXT,
  aadhar_number TEXT,
  nominee_name TEXT,
  relation_with_nominee TEXT,
  
  -- Contact Information
  email TEXT UNIQUE,
  mobile_number TEXT UNIQUE,
  
  -- Account Information
  account_type TEXT CHECK (account_type IN ('SAVINGS', 'CURRENT', 'FD', 'RD')),
  account_status TEXT CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'DORMANT', 'SUSPENDED')),
  account_open_date DATE,
  
  -- Bank Information
  ifsc_code TEXT,
  branch_name TEXT,
  
  -- Financial Information
  balance DECIMAL(15, 2) DEFAULT 0.00,
  
  -- Authentication
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_account_number CHECK (char_length(customer_id) > 0)
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_customer_id ON users(customer_id);
CREATE INDEX idx_users_account_status ON users(account_status);

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Accounts table - Detailed account information
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Account Information
  account_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_type TEXT CHECK (account_type IN ('SAVINGS', 'CURRENT', 'FD', 'RD', 'DEMAT')),
  account_status TEXT CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'DORMANT', 'FROZEN', 'CLOSED')),
  opening_balance DECIMAL(15, 2) DEFAULT 0.00,
  current_balance DECIMAL(15, 2) DEFAULT 0.00,
  
  -- Bank Information
  ifsc_code TEXT,
  branch_name TEXT,
  
  -- Account Details
  account_open_date DATE DEFAULT CURRENT_DATE,
  account_close_date DATE,
  
  -- Constraints
  CONSTRAINT valid_account_number_length CHECK (char_length(account_number) >= 8)
);

-- Create indexes for accounts
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_account_type ON accounts(account_type);
CREATE INDEX idx_accounts_account_status ON accounts(account_status);
CREATE INDEX idx_accounts_ifsc_code ON accounts(ifsc_code);

-- Apply trigger to accounts table
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Transactions table - Financial transactions
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Transaction Information
  transaction_id TEXT UNIQUE, -- Generated transaction reference ID
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_type TEXT CHECK (transaction_type IN (
    'DEBIT', 'CREDIT', 'TRANSFER_OUT', 'TRANSFER_IN', 'UPI_TRANSFER', 
    'ATM_WITHDRAWAL', 'CHEQUE_DEPOSIT', 'CASH_DEPOSIT', 'NEFT_TRANSFER',
    'IMPS_TRANSFER', 'RTGS_TRANSFER', 'SALARY_CREDIT', 'LOAN_DISBURSEMENT',
    'LOAN_EMI', 'INSURANCE_PREMIUM', 'TAX_PAYMENT', 'BILL_PAYMENT',
    'FD_CREATION', 'RD_CREATION', 'FD_MATURITY', 'RD_MATURITY',
    'INVESTMENT_PURCHASE', 'INVESTMENT_REDEMPTION', 'DIVIDEND_CREDIT',
    'BONUS_CREDIT', 'INTEREST_CREDIT', 'EMI_DEBIT', 'MERCHANT_PAYMENT', 'RECHARGE'
  )),
  
  -- Amount and Status
  amount DECIMAL(15, 2) NOT NULL,
  transaction_status TEXT CHECK (transaction_status IN ('completed', 'pending', 'failed', 'reversed', 'cancelled', 'initiated', 'processed', 'approved', 'rejected', 'on_hold', 'disputed', 'refunded', 'partial', 'complete')),
  balance_after DECIMAL(15, 2),
  
  -- Transaction Details
  description TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  transaction_time TIME WITH TIME ZONE DEFAULT NOW(),
  ifsc_code TEXT, -- IFSC of the other party in case of transfers
  within_bank BOOLEAN DEFAULT FALSE,
  remarks TEXT,
  
  -- Beneficiary/Counterparty Info
  beneficiary_name TEXT,
  beneficiary_account_number TEXT,
  
  -- Reference Information
  reference_number TEXT, -- NEFT/IMPS/RTGS reference number
  utr_number TEXT, -- Unique Transaction Reference
  
  -- Constraints
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create indexes for transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(transaction_status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_utr_number ON transactions(utr_number);
CREATE INDEX idx_transactions_amount ON transactions(amount);

-- Apply trigger to transactions table
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Beneficiaries table - Third-party accounts for transfers
CREATE TABLE beneficiaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User association
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Beneficiary Information
  beneficiary_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT,
  bank_name TEXT,
  nickname TEXT,
  is_within_bank BOOLEAN DEFAULT FALSE,
  
  -- Status and Verification
  status TEXT CHECK (status IN ('active', 'inactive', 'pending_verification', 'rejected', 'removed')) DEFAULT 'pending_verification',
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Limits and Configurations
  daily_limit DECIMAL(15, 2) DEFAULT 100000.00, -- Default daily limit: ₹1,00,000
  per_transaction_limit DECIMAL(15, 2) DEFAULT 50000.00, -- Default per transaction limit: ₹50,000
  
  -- Constraints
  CONSTRAINT valid_account_number_length CHECK (char_length(account_number) >= 8),
  CONSTRAINT valid_ifsc_length CHECK (char_length(ifsc_code) = 11 OR ifsc_code IS NULL)
);

-- Create indexes for beneficiaries
CREATE INDEX idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX idx_beneficiaries_account_number ON beneficiaries(account_number);
CREATE INDEX idx_beneficiaries_ifsc_code ON beneficiaries(ifsc_code);
CREATE INDEX idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX idx_beneficiaries_nickname ON beneficiaries(nickname);

-- Apply trigger to beneficiaries table
CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Bank configurations table - System-wide banking policies
CREATE TABLE bank_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Configuration Key-Value Pairs
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT,
  config_type TEXT CHECK (config_type IN ('string', 'number', 'boolean', 'json', 'array')),
  description TEXT,
  
  -- Limits and Policies
  min_balance_requirement DECIMAL(15, 2) DEFAULT 5000.00, -- Minimum balance: ₹5,000
  daily_transaction_limit DECIMAL(15, 2) DEFAULT 100000.00, -- Daily limit: ₹1,00,000
  daily_atm_limit DECIMAL(15, 2) DEFAULT 25000.00, -- ATM limit: ₹25,000
  daily_upi_limit DECIMAL(15, 2) DEFAULT 100000.00, -- UPI limit: ₹1,00,000
  per_transaction_limit DECIMAL(15, 2) DEFAULT 50000.00, -- Per transaction: ₹50,000
  monthly_transfer_limit DECIMAL(15, 2) DEFAULT 1000000.00, -- Monthly limit: ₹10,00,000
  within_bank_prefixes TEXT DEFAULT '605,606', -- Comma-separated prefixes
  
  -- Authentication Settings
  default_mpin TEXT DEFAULT '0000',
  mpin_attempts_limit INTEGER DEFAULT 3,
  session_timeout_minutes INTEGER DEFAULT 30,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for bank configurations
CREATE INDEX idx_bank_configurations_key ON bank_configurations(config_key);
CREATE INDEX idx_bank_configurations_active ON bank_configurations(is_active);

-- Apply trigger to bank configurations table
CREATE TRIGGER update_bank_configurations_updated_at BEFORE UPDATE ON bank_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default configuration values
INSERT INTO bank_configurations (config_key, config_value, config_type, description) VALUES
  ('min_balance_requirement', '5000.00', 'number', 'Minimum balance requirement for accounts'),
  ('daily_transaction_limit', '100000.00', 'number', 'Daily transaction limit per account'),
  ('daily_atm_limit', '25000.00', 'number', 'Daily ATM withdrawal limit'),
  ('daily_upi_limit', '100000.00', 'number', 'Daily UPI transaction limit'),
  ('per_transaction_limit', '50000.00', 'number', 'Per transaction limit'),
  ('monthly_transfer_limit', '1000000.00', 'number', 'Monthly transfer limit'),
  ('within_bank_prefixes', '605,606', 'string', 'Account number prefixes for within bank transfers'),
  ('default_mpin', '0000', 'string', 'Default MPIN for new users'),
  ('mpin_attempts_limit', '3', 'number', 'Maximum MPIN attempts before lockout'),
  ('session_timeout_minutes', '30', 'number', 'Session timeout in minutes');

-- 6. User authentication table - Security management
CREATE TABLE user_authentication (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User association
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Authentication Information
  email TEXT UNIQUE,
  password_hash TEXT, -- Stored as hashed value
  mpin_hash TEXT, -- MPIN stored as hashed value
  security_questions JSONB, -- Store security questions as JSON
  
  -- Authentication Status
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_mobile_verified BOOLEAN DEFAULT FALSE,
  is_kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_documents JSONB, -- Store KYC document references
  
  -- Security
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_mpin_change TIMESTAMP WITH TIME ZONE,
  
  -- Sessions
  current_session_token TEXT,
  session_expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for user authentication
CREATE INDEX idx_user_auth_user_id ON user_authentication(user_id);
CREATE INDEX idx_user_auth_email ON user_authentication(email);
CREATE INDEX idx_user_auth_session_token ON user_authentication(current_session_token);
CREATE INDEX idx_user_auth_locked_until ON user_authentication(account_locked_until);

-- Apply trigger to user authentication table
CREATE TRIGGER update_user_authentication_updated_at BEFORE UPDATE ON user_authentication
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Notifications table - User alerts and system messages
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User association
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Information
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT CHECK (notification_type IN (
    'transaction', 'account', 'payment', 'security', 'system', 'promotional', 'reminder'
  )),
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Priority
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  
  -- Metadata
  metadata JSONB, -- Store additional information like transaction ID, etc.
  action_url TEXT -- URL to navigate to when notification is clicked
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_status ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Apply trigger to notifications table
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Audit logs table - Track all admin and user activities
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Actor Information
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who performed the action
  admin_user_id UUID, -- Admin user who made changes (if applicable)
  ip_address INET,
  user_agent TEXT,
  
  -- Action Information
  action_type TEXT NOT NULL, -- Type of action (create, update, delete, login, etc.)
  table_name TEXT, -- Name of the table affected
  record_id UUID, -- ID of the record that was affected
  old_values JSONB, -- Previous values before update
  new_values JSONB, -- New values after update
  description TEXT, -- Description of the action
  
  -- Status
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);

-- 9. Statements table - Account statements and passbook entries
CREATE TABLE statements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Account association
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Statement Information
  statement_type TEXT CHECK (statement_type IN ('monthly', 'quarterly', 'annual', 'custom', 'passbook')) DEFAULT 'monthly',
  statement_date DATE NOT NULL,
  statement_period_start DATE,
  statement_period_end DATE,
  statement_number TEXT UNIQUE, -- Unique statement number
  
  -- Content and Metadata
  statement_content JSONB, -- Store statement details as JSON
  total_credits DECIMAL(15, 2) DEFAULT 0.00,
  total_debits DECIMAL(15, 2) DEFAULT 0.00,
  opening_balance DECIMAL(15, 2),
  closing_balance DECIMAL(15, 2),
  
  -- File Information
  file_url TEXT, -- URL to the generated PDF statement file
  file_size INTEGER, -- Size of statement file in bytes
  is_generated BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for statements
CREATE INDEX idx_statements_account_id ON statements(account_id);
CREATE INDEX idx_statements_user_id ON statements(user_id);
CREATE INDEX idx_statements_date ON statements(statement_date);
CREATE INDEX idx_statements_type ON statements(statement_type);
CREATE INDEX idx_statements_number ON statements(statement_number);
CREATE INDEX idx_statements_period ON statements(statement_period_start, statement_period_end);

-- Apply trigger to statements table
CREATE TRIGGER update_statements_updated_at BEFORE UPDATE ON statements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. System settings table - Application-wide configurations
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Setting Information
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
  setting_category TEXT, -- Category like 'security', 'ui', 'payment', 'notifications'
  description TEXT,
  
  -- Admin Information
  updated_by_admin_id UUID, -- ID of admin who last updated this setting
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for system settings
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(setting_category);
CREATE INDEX idx_system_settings_active ON system_settings(is_active);

-- Apply trigger to system settings table
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, setting_category, description) VALUES
  ('app_name', 'Mahamobile Plus Banking Application', 'string', 'ui', 'Name of the banking application'),
  ('app_version', '1.0.0', 'string', 'system', 'Current version of the application'),
  ('maintenance_mode', 'false', 'boolean', 'system', 'Whether the app is in maintenance mode'),
  ('daily_transaction_limit', '100000', 'number', 'limits', 'Default daily transaction limit'),
  ('daily_atm_limit', '25000', 'number', 'limits', 'Default daily ATM withdrawal limit'),
  ('daily_upi_limit', '100000', 'number', 'limits', 'Default daily UPI transaction limit'),
  ('per_transaction_limit', '50000', 'number', 'limits', 'Default per transaction limit'),
  ('monthly_transfer_limit', '1000000', 'number', 'limits', 'Default monthly transfer limit'),
  ('minimum_balance', '5000', 'number', 'limits', 'Minimum balance requirement'),
  ('default_pin', '0000', 'string', 'security', 'Default PIN for new users'),
  ('pin_attempts_limit', '3', 'number', 'security', 'Maximum PIN attempts before lockout'),
  ('session_timeout', '30', 'number', 'security', 'Session timeout in minutes'),
  ('encryption_enabled', 'true', 'boolean', 'security', 'Whether encryption is enabled'),
  ('logging_enabled', 'true', 'boolean', 'system', 'Whether system logging is enabled'),
  ('audit_trail_enabled', 'true', 'boolean', 'compliance', 'Whether audit trail is enabled'),
  ('compliance_monitoring', 'true', 'boolean', 'compliance', 'Whether compliance monitoring is active');

-- Create a view to get user details with account information
CREATE VIEW user_account_details AS
SELECT 
    u.id,
    u.account_holder_name,
    u.customer_id,
    u.email,
    u.mobile_number,
    u.account_type,
    u.account_status,
    u.balance AS user_balance,
    u.ifsc_code,
    u.branch_name,
    a.account_number,
    a.current_balance AS account_balance,
    a.account_open_date
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id;

-- Create a view to get transaction summary for dashboard
CREATE VIEW transaction_summary AS
SELECT 
    t.user_id,
    u.account_holder_name,
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN t.transaction_type = 'CREDIT' THEN t.amount ELSE 0 END) AS total_credits,
    SUM(CASE WHEN t.transaction_type = 'DEBIT' THEN t.amount ELSE 0 END) AS total_debits,
    MAX(t.created_at) AS last_transaction_date
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.transaction_status = 'completed'
GROUP BY t.user_id, u.account_holder_name;