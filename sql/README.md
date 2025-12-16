# Banking Application Database Schema

This directory contains the SQL schema for the Mahamobile Plus Banking Application. The schema is designed to manage all hardcoded data mentioned in the requirements document and provide a centralized system for admin management.

## Schema Overview

### 1. Users Table (`users`)
- Core user information including personal details, contact information, and account status
- Links to other related tables through foreign keys
- Handles account holder information like name, DOB, address, PAN, Aadhar, etc.

### 2. Accounts Table (`accounts`)
- Detailed account information linked to users
- Stores account numbers, types, balances, and bank details
- Supports various account types (SAVINGS, CURRENT, FD, RD, DEMAT)

### 3. Transactions Table (`transactions`)
- Financial transactions with comprehensive details
- Tracks transaction ID, type, amount, status, and reference numbers
- Supports various transaction types including UPI, NEFT, IMPS, etc.
- Includes UTR numbers and beneficiary information

### 4. Beneficiaries Table (`beneficiaries`)
- Third-party accounts for money transfers
- Manages beneficiary verification and limits
- Supports both within-bank and other-bank transfers

### 5. Bank Configurations Table (`bank_configurations`)
- System-wide banking policies and limits
- Stores account limits, daily limits, transaction limits
- Configurable through admin panel without code changes

### 6. User Authentication Table (`user_authentication`)
- Security management including password and MPIN hashes
- Tracks verification status and login attempts
- Supports KYC verification status

### 7. Notifications Table (`notifications`)
- User alerts and system messages
- Supports different notification types and priorities
- Tracks read/unread status

### 8. Audit Logs Table (`audit_logs`)
- Tracks all admin and user activities for compliance
- Stores before and after values for changes
- Maintains IP addresses and user agents

### 9. Statements Table (`statements`)
- Account statements and passbook entries
- Generates monthly, quarterly, and annual statements
- Stores PDF links and statement metadata

### 10. System Settings Table (`system_settings`)
- Application-wide configurations
- Controls app settings like maintenance mode, limits, etc.
- Configurable through admin panel

## Key Features

- **Supabase Ready**: Designed to work with Supabase PostgreSQL database
- **Audit Trail**: Comprehensive logging for all changes (Requirement 10)
- **Real-time Updates**: Schema supports dynamic updates without app changes (Requirement 9)
- **Compliance Ready**: Built to meet banking regulations (Requirement 10)
- **Scalable**: Supports bulk operations and multiple accounts (Requirement 9)

## Views

- `user_account_details`: Combines user and account information
- `transaction_summary`: Aggregates transaction data for dashboards

## Indexes

All tables include appropriate indexes for performance optimization:
- Foreign key relationships
- Frequently queried columns
- Status fields
- Date ranges

## Constraints

- Data validation through CHECK constraints
- Unique constraints for account numbers, emails, etc.
- Business rule enforcement (e.g., positive amounts)