-- Create user_authentication table for security management
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

-- Create indexes for performance
CREATE INDEX idx_user_auth_user_id ON user_authentication(user_id);
CREATE INDEX idx_user_auth_email ON user_authentication(email);
CREATE INDEX idx_user_auth_session_token ON user_authentication(current_session_token);
CREATE INDEX idx_user_auth_locked_until ON user_authentication(account_locked_until);

-- Apply trigger to update user_authentication table
CREATE TRIGGER update_user_authentication_updated_at BEFORE UPDATE ON user_authentication
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();