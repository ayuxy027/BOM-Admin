-- Create statements table for account statements and passbook entries
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

-- Create indexes for performance
CREATE INDEX idx_statements_account_id ON statements(account_id);
CREATE INDEX idx_statements_user_id ON statements(user_id);
CREATE INDEX idx_statements_date ON statements(statement_date);
CREATE INDEX idx_statements_type ON statements(statement_type);
CREATE INDEX idx_statements_number ON statements(statement_number);
CREATE INDEX idx_statements_period ON statements(statement_period_start, statement_period_end);

-- Apply trigger to update statements table
CREATE TRIGGER update_statements_updated_at BEFORE UPDATE ON statements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();