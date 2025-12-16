-- Create accounts table for banking application
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

-- Create indexes for performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_account_type ON accounts(account_type);
CREATE INDEX idx_accounts_account_status ON accounts(account_status);
CREATE INDEX idx_accounts_ifsc_code ON accounts(ifsc_code);

-- Apply trigger to update accounts table
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();