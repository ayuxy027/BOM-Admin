/**
 * Transaction Types and Interfaces
 * Centralized type definitions for transaction operations
 */

import { supabase } from '@/integrations/supabase/client';

// Transaction types that ADD to balance
export const CREDIT_TYPES = ['CREDIT', 'TRANSFER_IN', 'DEPOSIT', 'CHEQUE_DEPOSIT'] as const;

// Transaction types that SUBTRACT from balance
export const DEBIT_TYPES = ['DEBIT', 'TRANSFER_OUT', 'ATM_WITHDRAWAL', 'UTILITY_PAYMENT', 'UPI_TRANSFER', 'CHEQUE_WITHDRAWAL'] as const;

// All valid transaction types from schema
export type TransactionType =
    | 'DEBIT' | 'CREDIT'
    | 'TRANSFER_OUT' | 'TRANSFER_IN'
    | 'ATM_WITHDRAWAL' | 'DEPOSIT'
    | 'UTILITY_PAYMENT' | 'UPI_TRANSFER'
    | 'CHEQUE_DEPOSIT' | 'CHEQUE_WITHDRAWAL';

// Transaction status types
export type TransactionStatus = 'success' | 'pending' | 'failed' | 'reversed';

// Statuses that should impact balance
export const BALANCE_IMPACTING_STATUSES: TransactionStatus[] = ['success'];

// Full transaction interface matching the schema
export interface Transaction {
    id: string;
    user_id: string;
    transaction_id: string;
    transaction_date: string;
    transaction_time: string;
    transaction_type: TransactionType;
    description: string;
    beneficiary_name?: string | null;
    beneficiary_account_number?: string | null;
    beneficiary_ifsc?: string | null;
    beneficiary_bank_name?: string | null;
    beneficiary_bank_code?: string | null;
    amount: number;
    debit?: number | null;
    credit?: number | null;
    balance_after: number;
    remarks?: string | null;
    reference_number?: string | null;
    narration?: string | null;
    status: TransactionStatus;
    category?: string | null;
    is_within_bank?: boolean;
    created_at?: string;
    updated_at?: string;
}

// Input for adding a new transaction
export interface AddTransactionInput {
    user_id: string;
    transaction_date: string;
    transaction_type: TransactionType;
    amount: number;
    narration: string;
    description?: string;
    beneficiary_name?: string;
    status?: TransactionStatus;
    category?: string;
    remarks?: string;
    reference_number?: string;
}

// Input for editing a transaction
export interface EditTransactionInput {
    transaction_type?: TransactionType;
    amount?: number;
    narration?: string;
    description?: string;
    beneficiary_name?: string;
    status?: TransactionStatus;
    reference_number?: string;
}

// Result from balance calculation
export interface BalanceCalculationResult {
    success: boolean;
    previousBalance: number;
    newBalance: number;
    transactionsUpdated: number;
}

/**
 * Check if a transaction type is a credit (adds to balance)
 */
export function isCredit(type: TransactionType): boolean {
    return (CREDIT_TYPES as readonly string[]).includes(type);
}

/**
 * Check if a transaction type is a debit (subtracts from balance)
 */
export function isDebit(type: TransactionType): boolean {
    return (DEBIT_TYPES as readonly string[]).includes(type);
}

/**
 * Check if a transaction status should impact balance
 */
export function shouldImpactBalance(status: TransactionStatus): boolean {
    return BALANCE_IMPACTING_STATUSES.includes(status);
}

/**
 * Calculate the balance impact of a transaction
 * Returns positive for credit, negative for debit, or 0 if status doesn't impact
 */
export function calculateImpact(amount: number, type: TransactionType, status: TransactionStatus): number {
    // Only successful transactions impact balance
    if (!shouldImpactBalance(status)) {
        return 0;
    }

    if (isCredit(type)) {
        return amount;
    } else if (isDebit(type)) {
        return -amount;
    }

    return 0;
}

/**
 * Get debit and credit column values based on transaction type
 */
export function getDebitCreditValues(amount: number, type: TransactionType): { debit: number | null; credit: number | null } {
    if (isCredit(type)) {
        return { debit: null, credit: amount };
    } else {
        return { debit: amount, credit: null };
    }
}

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `TXN_${timestamp}_${random}`;
}

/**
 * Get current date and time in Indian Standard Time (IST, UTC+5:30)
 * This ensures all transactions use Indian timezone regardless of server/browser timezone
 */
function getIndianDateTime(): Date {
    const now = new Date();
    // Get UTC time and add 5 hours 30 minutes for IST
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    return new Date(utcTime + istOffset);
}

/**
 * Get current time string in HH:MM:SS format (Indian Standard Time)
 */
export function getCurrentTimeString(): string {
    const istDate = getIndianDateTime();
    const hours = String(istDate.getHours()).padStart(2, '0');
    const minutes = String(istDate.getMinutes()).padStart(2, '0');
    const seconds = String(istDate.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Get current date string in YYYY-MM-DD format (Indian Standard Time)
 */
export function getCurrentDateString(): string {
    const istDate = getIndianDateTime();
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get user's stored initial balance before any transactions
 * This is the balance we need to start calculations from
 */
export async function getUserInitialBalance(userId: string): Promise<number> {
    // Get the first transaction for this user
    const { data: firstTx, error: txError } = await supabase
        .from('user_transactions')
        .select('balance_after, amount, transaction_type, status')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: true })
        .order('transaction_time', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

    if (txError || !firstTx) {
        // No transactions, get current user balance
        const { data: userData } = await supabase
            .from('user_details')
            .select('balance')
            .eq('user_id', userId)
            .single();

        return userData?.balance || 0;
    }

    // Reverse calculate initial balance from first transaction
    // If first tx added +500, and balance_after was 10500, initial was 10000
    const impact = calculateImpact(firstTx.amount, firstTx.transaction_type as TransactionType, firstTx.status as TransactionStatus);
    return (firstTx.balance_after || 0) - impact;
}
