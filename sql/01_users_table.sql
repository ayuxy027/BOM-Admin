-- Create users table for banking application
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

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_customer_id ON users(customer_id);
CREATE INDEX idx_users_account_status ON users(account_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();