-- Create beneficiaries table for banking application
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

-- Create indexes for performance
CREATE INDEX idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX idx_beneficiaries_account_number ON beneficiaries(account_number);
CREATE INDEX idx_beneficiaries_ifsc_code ON beneficiaries(ifsc_code);
CREATE INDEX idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX idx_beneficiaries_nickname ON beneficiaries(nickname);

-- Apply trigger to update beneficiaries table
CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();