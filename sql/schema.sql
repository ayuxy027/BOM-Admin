-- Supabase Schema for Mahamobile Plus Banking Application
-- This schema replaces all hardcoded data mentioned in data.md

-- Function to automatically update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Table 1: Users - Core account holder information
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Personal Information (from data.md section 1, 12, 14, 15)
  account_holder_name TEXT NOT NULL, -- 'Mr BAL GOPAL LUHA'
  customer_id TEXT UNIQUE, -- 'CUST_2025_001'
  date_of_birth DATE, -- '1990-01-15'
  address TEXT, -- '123, MG Road, Mumbai, Maharashtra - 400001'
  pan_number TEXT, -- 'ABCDE1234F'
  aadhar_number TEXT, -- '1234-5678-9012'
  nominee_name TEXT, -- 'Family Member'
  relation_with_nominee TEXT, -- 'Spouse'
  
  -- Contact Information (from data.md section 6, 13)
  email TEXT UNIQUE, -- 'user@mahabank.com'
  mobile_number TEXT UNIQUE, -- '+91 9876543210'
  
  -- Account Information (from data.md section 1)
  account_type TEXT CHECK (account_type IN ('SAVINGS', 'CURRENT', 'FD', 'RD')), -- 'SAVINGS'
  account_status TEXT CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'DORMANT', 'SUSPENDED')), -- 'ACTIVE'
  account_open_date DATE, -- '2020-01-01'
  
  -- Bank Information (from data.md section 1)
  ifsc_code TEXT, -- 'MAHB0001234'
  branch_name TEXT, -- 'Mumbai Main Branch'
  
  -- Financial Information (from data.md section 1)
  balance DECIMAL(15, 2) DEFAULT 0.00, -- '50000.0'
  
  -- Authentication
  last_login TIMESTAMP WITH TIME ZONE
);

-- Table 2: Accounts - Specific account details
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Account Information (from data.md section 1, 6)
  account_number TEXT UNIQUE NOT NULL, -- '60543803435'
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_type TEXT CHECK (account_type IN ('SAVINGS', 'CURRENT', 'FD', 'RD', 'DEMAT')),
  account_status TEXT CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'DORMANT', 'FROZEN', 'CLOSED')),
  opening_balance DECIMAL(15, 2) DEFAULT 0.00,
  current_balance DECIMAL(15, 2) DEFAULT 0.00,
  
  -- Bank Information (from data.md section 1)
  ifsc_code TEXT, -- 'MAHB0001234'
  branch_name TEXT, -- 'Mumbai Main Branch'
  
  -- Account Details
  account_open_date DATE DEFAULT CURRENT_DATE,
  account_close_date DATE,
  
  -- Constraints
  CONSTRAINT valid_account_number_length CHECK (char_length(account_number) >= 8)
);

-- Table 3: Transactions - Financial transaction records
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Transaction Information (from data.md section 3)
  transaction_id TEXT UNIQUE, -- 'TXN_1733998200000_a8k2m9x7p'
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
  
  -- Amount and Status (from data.md section 3, 5, 23)
  amount DECIMAL(15, 2) NOT NULL, -- Various amounts from data.md: 1500, 45000, 5000, etc.
  transaction_status TEXT CHECK (transaction_status IN ('completed', 'pending', 'failed', 'reversed', 'cancelled', 'initiated', 'processed', 'approved', 'rejected', 'on_hold', 'disputed', 'refunded', 'partial', 'complete')),
  balance_after DECIMAL(15, 2), -- Balance after transaction: 50000, 51500, etc.
  
  -- Transaction Details (from data.md section 3, 22)
  description TEXT, -- Transaction descriptions: 'UPI Transfer to Amazon Pay', 'Salary Credit', etc.
  transaction_date DATE DEFAULT CURRENT_DATE, -- Transaction dates: 2025-12-12, 2025-12-10, etc.
  transaction_time TIME WITH TIME ZONE DEFAULT NOW(), -- Transaction times: 14:30:00, 09:20:00, etc.
  ifsc_code TEXT, -- IFSC codes from data.md: UTIB0002083, HDFC0000123, etc.
  within_bank BOOLEAN DEFAULT FALSE, -- 'Within Bank' flag from data.md
  remarks TEXT, -- Additional remarks from data.md: 'Branch: Mumbai Main - Teller #4', etc.
  
  -- Beneficiary/Counterparty Info (from data.md section 3, 17)
  beneficiary_name TEXT, -- Beneficiary names from data.md: 'Amazon Pay', 'TechSoft Solutions', etc.
  beneficiary_account_number TEXT, -- Beneficiary account numbers from data.md
  
  -- Reference Information (from data.md section 10)
  reference_number TEXT, -- NEFT reference: 'REF123456789'
  utr_number TEXT, -- Unique Transaction Reference from data.md: '765395574585'
  
  -- Constraints
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Table 4: Beneficiaries - Third-party accounts for transfers
CREATE TABLE beneficiaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User association
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Beneficiary Information (from data.md section 2, 7, 17)
  beneficiary_name TEXT NOT NULL, -- Names from data.md: 'Rajesh Kumar', 'Priya Sharma', etc.
  account_number TEXT NOT NULL, -- Account numbers from data.md: '98765432101', '12345678901', etc.
  ifsc_code TEXT, -- IFSC codes from data.md: 'MAHB0001234', 'SBIN0001234', etc.
  bank_name TEXT, -- Bank names from data.md: 'Maharashtra Bank', 'State Bank of India', etc.
  nickname TEXT, -- Nicknames from data.md: 'Friend', 'Family', 'Business Partner', 'Sister'
  is_within_bank BOOLEAN DEFAULT FALSE, -- 'Within Bank' flag from data.md
  
  -- Status and Verification
  status TEXT CHECK (status IN ('active', 'inactive', 'pending_verification', 'rejected', 'removed')) DEFAULT 'pending_verification',
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Limits and Configurations (from data.md section 5)
  daily_limit DECIMAL(15, 2) DEFAULT 100000.00, -- Daily limit: ₹1,00,000
  per_transaction_limit DECIMAL(15, 2) DEFAULT 50000.00, -- Per transaction: ₹50,000
  
  -- Constraints
  CONSTRAINT valid_account_number_length CHECK (char_length(account_number) >= 8),
  CONSTRAINT valid_ifsc_length CHECK (char_length(ifsc_code) = 11 OR ifsc_code IS NULL)
);

-- Table 5: System Configuration - Application settings and limits
CREATE TABLE system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Configuration Key-Value Pairs (from data.md section 5)
  config_key TEXT UNIQUE NOT NULL, -- Configuration keys
  config_value TEXT, -- Configuration values
  config_type TEXT CHECK (config_type IN ('string', 'number', 'boolean', 'json', 'array')),
  description TEXT, -- Description of the configuration
  
  -- Limits and Policies (from data.md section 5)
  min_balance_requirement DECIMAL(15, 2) DEFAULT 5000.00, -- '₹5,000'
  daily_transaction_limit DECIMAL(15, 2) DEFAULT 100000.00, -- '₹1,00,000'
  daily_atm_limit DECIMAL(15, 2) DEFAULT 25000.00, -- '₹25,000'
  daily_upi_limit DECIMAL(15, 2) DEFAULT 100000.00, -- '₹1,00,000'
  per_transaction_limit DECIMAL(15, 2) DEFAULT 50000.00, -- '₹50,000'
  monthly_transfer_limit DECIMAL(15, 2) DEFAULT 1000000.00, -- '₹10,00,000'
  within_bank_prefixes TEXT DEFAULT '605,606', -- '605' or '606'
  
  -- Authentication Settings (from data.md section 4)
  default_mpin TEXT DEFAULT '0000', -- '0000'
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

-- Table 6: User Authentication - Security information
CREATE TABLE user_authentication (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User association
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Authentication Information (from data.md section 4)
  email TEXT UNIQUE,
  password_hash TEXT,
  mpin_hash TEXT, -- Default MPIN from data.md: '0000'
  security_questions JSONB,
  
  -- Authentication Status
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_mobile_verified BOOLEAN DEFAULT FALSE,
  is_kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_documents JSONB,
  
  -- Security
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_mpin_change TIMESTAMP WITH TIME ZONE,
  
  -- Sessions
  current_session_token TEXT,
  session_expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_customer_id ON users(customer_id);
CREATE INDEX idx_users_account_status ON users(account_status);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_account_type ON accounts(account_type);
CREATE INDEX idx_accounts_account_status ON accounts(account_status);
CREATE INDEX idx_accounts_ifsc_code ON accounts(ifsc_code);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(transaction_status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_utr_number ON transactions(utr_number);
CREATE INDEX idx_transactions_amount ON transactions(amount);

CREATE INDEX idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX idx_beneficiaries_account_number ON beneficiaries(account_number);
CREATE INDEX idx_beneficiaries_ifsc_code ON beneficiaries(ifsc_code);
CREATE INDEX idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX idx_beneficiaries_nickname ON beneficiaries(nickname);

CREATE INDEX idx_system_config_key ON system_config(config_key);
CREATE INDEX idx_system_config_active ON system_config(is_active);

CREATE INDEX idx_user_auth_user_id ON user_authentication(user_id);
CREATE INDEX idx_user_auth_email ON user_authentication(email);

-- Apply triggers to update 'updated_at' for tables that need it
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_authentication_updated_at BEFORE UPDATE ON user_authentication
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system configuration based on hardcoded values from data.md
INSERT INTO system_config (config_key, config_value, config_type, description, min_balance_requirement, daily_transaction_limit, daily_atm_limit, daily_upi_limit, per_transaction_limit, monthly_transfer_limit, within_bank_prefixes, default_mpin) VALUES
  ('min_balance_requirement', '5000.00', 'number', 'Minimum balance requirement', 5000.00, 100000.00, 25000.00, 100000.00, 50000.00, 1000000.00, '605,606', '0000'),
  ('daily_transaction_limit', '100000.00', 'number', 'Daily transaction limit', 5000.00, 100000.00, 25000.00, 100000.00, 50000.00, 1000000.00, '605,606', '0000'),
  ('daily_atm_limit', '25000.00', 'number', 'Daily ATM limit', 5000.00, 100000.00, 25000.00, 100000.00, 50000.00, 1000000.00, '605,606', '0000'),
  ('daily_upi_limit', '100000.00', 'number', 'Daily UPI limit', 5000.00, 100000.00, 25000.00, 100000.00, 50000.00, 1000000.00, '605,606', '0000'),
  ('per_transaction_limit', '50000.00', 'number', 'Per transaction limit', 5000.00, 100000.00, 25000.00, 100000.00, 50000.00, 1000000.00, '605,606', '0000'),
  ('monthly_transfer_limit', '1000000.00', 'number', 'Monthly transfer limit', 5000.00, 100000.00, 25000.00, 100000.00, 50000.00, 1000000.00, '605,606', '0000');

-- Insert demo user data based on hardcoded values from data.md
INSERT INTO users (account_holder_name, customer_id, date_of_birth, address, pan_number, aadhar_number, nominee_name, relation_with_nominee, email, mobile_number, account_type, account_status, account_open_date, ifsc_code, branch_name, balance) VALUES
  ('Mr BAL GOPAL LUHA', 'CUST_2025_001', '1990-01-15', '123, MG Road, Mumbai, Maharashtra - 400001', 'ABCDE1234F', '1234-5678-9012', 'Family Member', 'Spouse', 'user@mahabank.com', '+91 9876543210', 'SAVINGS', 'ACTIVE', '2020-01-01', 'MAHB0001234', 'Mumbai Main Branch', 50000.0);

-- Get the user ID for the demo user to use in related tables
WITH demo_user AS (
  SELECT id FROM users WHERE customer_id = 'CUST_2025_001'
)
INSERT INTO accounts (user_id, account_number, account_type, account_status, opening_balance, current_balance, ifsc_code, branch_name, account_open_date)
SELECT id, '60543803435', 'SAVINGS', 'ACTIVE', 50000.0, 50000.0, 'MAHB0001234', 'Mumbai Main Branch', '2020-01-01'
FROM demo_user;

-- Insert demo beneficiaries based on hardcoded values from data.md
WITH demo_user AS (
  SELECT id FROM users WHERE customer_id = 'CUST_2025_001'
)
INSERT INTO beneficiaries (user_id, beneficiary_name, account_number, ifsc_code, bank_name, nickname, is_within_bank)
SELECT id, 'Rajesh Kumar', '98765432101', 'MAHB0001234', 'Maharashtra Bank', 'Friend', true
FROM demo_user;

WITH demo_user AS (
  SELECT id FROM users WHERE customer_id = 'CUST_2025_001'
)
INSERT INTO beneficiaries (user_id, beneficiary_name, account_number, ifsc_code, bank_name, nickname, is_within_bank)
SELECT id, 'Priya Sharma', '12345678901', 'MAHB0001234', 'Maharashtra Bank', 'Family', true
FROM demo_user;

WITH demo_user AS (
  SELECT id FROM users WHERE customer_id = 'CUST_2025_001'
)
INSERT INTO beneficiaries (user_id, beneficiary_name, account_number, ifsc_code, bank_name, nickname, is_within_bank)
SELECT id, 'Amit Patel', '45678912301', 'SBIN0001234', 'State Bank of India', 'Business Partner', false
FROM demo_user;

-- Insert demo transactions based on hardcoded values from data.md
WITH demo_user AS (
  SELECT id FROM users WHERE customer_id = 'CUST_2025_001'
),
demo_account AS (
  SELECT id FROM accounts WHERE account_number = '60543803435'
)
INSERT INTO transactions (user_id, account_id, transaction_id, transaction_type, amount, transaction_status, balance_after, description, transaction_date, transaction_time, ifsc_code, within_bank, remarks, beneficiary_name, beneficiary_account_number, reference_number, utr_number)
SELECT 
  u.id, a.id, 
  'TXN_1733998200000_a8k2m9x7p', 'UPI_TRANSFER', 1500.00, 'completed', 50000.00, 
  'UPI Transfer to Amazon Pay', '2025-12-12', '14:30:00'::time, 'UTIB0002083', false,
  'Order #AMZ-8827364512', 'Amazon Pay', '917020043210', NULL, '765395574585'
FROM demo_user u, demo_account a;