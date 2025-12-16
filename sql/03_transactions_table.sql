-- Create transactions table for banking application
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

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(transaction_status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_utr_number ON transactions(utr_number);
CREATE INDEX idx_transactions_amount ON transactions(amount);

-- Apply trigger to update transactions table
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();