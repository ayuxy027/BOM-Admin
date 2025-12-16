-- Create system_settings table for application-wide configurations
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

-- Create indexes for performance
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(setting_category);
CREATE INDEX idx_system_settings_active ON system_settings(is_active);

-- Apply trigger to update system_settings table
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings based on requirements
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