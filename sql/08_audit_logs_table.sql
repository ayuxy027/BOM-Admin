-- Create audit_logs table for tracking all admin and user activities
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

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);

-- Note: audit_logs doesn't need the update trigger since it's write-only