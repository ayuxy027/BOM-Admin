# Banking Application Database Schema

This directory contains the essential SQL schema for the Mahamobile Plus Banking Application. The schema is designed to replace all hardcoded data mentioned in the data.md file and provide a centralized system for admin management.

## Schema Overview

The schema contains 6 core tables that address all hardcoded data from data.md:

### 1. Users Table (`users`)
- Core user information including personal details, contact information, and account status
- Replaces hardcoded user data from sections 1, 12, 14, 15 of data.md
- Stores account holder name, customer ID, DOB, address, PAN, Aadhar, nominee info

### 2. Accounts Table (`accounts`)
- Specific account details linked to users
- Replaces hardcoded account numbers and details from sections 1, 6 of data.md
- Stores account numbers, types, balances, and bank details

### 3. Transactions Table (`transactions`)
- Financial transactions with comprehensive details
- Replaces hardcoded transactions from section 3 of data.md 
- Tracks transaction ID, type, amount, status, reference numbers, and beneficiary info
- Supports all transaction types and statuses mentioned in data.md

### 4. Beneficiaries Table (`beneficiaries`)
- Third-party accounts for money transfers
- Replaces hardcoded beneficiaries from sections 2, 7, 17 of data.md
- Manages beneficiary verification, limits, and within-bank flags

### 5. System Configuration Table (`system_config`)
- Application settings and financial limits
- Replaces hardcoded limits from section 5 of data.md
- Stores account limits, daily limits, transaction limits, and default MPIN

### 6. User Authentication Table (`user_authentication`)
- Security management including password and MPIN hashes
- Replaces hardcoded authentication data from section 4 of data.md
- Tracks verification status and security information

## Key Features

- **Supabase Ready**: Designed to work with Supabase PostgreSQL database
- **Complete Coverage**: Addresses all hardcoded data points from data.md
- **Performance Optimized**: Includes appropriate indexes for all critical queries
- **Data Integrity**: Uses check constraints and foreign key relationships
- **Audit Ready**: Includes updated_at timestamps for tracking changes

## Indexes

All tables include appropriate indexes for performance optimization:
- Foreign key relationships
- Frequently queried columns (email, mobile, account number)
- Status fields
- Date ranges
- Transaction amounts

## Constraints

- Data validation through CHECK constraints for account types, transaction types, statuses
- Unique constraints for account numbers, emails, etc.
- Business rule enforcement (e.g., positive amounts, valid IFSC length)
- Proper decimal precision for financial data (DECIMAL 15,2)

## Sample Data

The schema includes sample data insertion based on the demo data from data.md:
- Primary user: Mr BAL GOPAL LUHA (CUST_2025_001)
- Primary account: 60543803435
- Demo beneficiaries: Rajesh Kumar, Priya Sharma, Amit Patel
- Sample transaction: UPI Transfer to Amazon Pay

This schema completely replaces all hardcoded data mentioned in the data.md file and provides a centralized, database-driven approach for managing the banking application's data.