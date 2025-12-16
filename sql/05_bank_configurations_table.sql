-- Create bank_configurations table for application settings
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

-- Create indexes for performance
CREATE INDEX idx_bank_configurations_key ON bank_configurations(config_key);
CREATE INDEX idx_bank_configurations_active ON bank_configurations(is_active);

-- Apply trigger to update bank_configurations table
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