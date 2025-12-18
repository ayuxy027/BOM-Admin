/**
 * Add Transaction Service
 * Handles creating new transactions with proper balance calculation
 * 
 * IMPACT ANALYSIS:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ When adding a transaction, these fields IMPACT balance:        │
 * │                                                                  │
 * │ 1. transaction_date → Determines position in timeline          │
 * │ 2. transaction_type → Determines direction (+/-)               │
 * │    • CREDIT, TRANSFER_IN, DEPOSIT → +amount                    │
 * │    • DEBIT, TRANSFER_OUT, ATM_WITHDRAWAL → -amount             │
 * │ 3. amount → The value added/subtracted                         │
 * │ 4. status → Only 'success' transactions affect balance         │
 * │                                                                  │
 * │ These fields do NOT impact balance:                            │
 * │ • narration, description, beneficiary_name, remarks, etc.      │
 * └─────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import {
    AddTransactionInput,
    generateTransactionId,
    getCurrentTimeString,
    getCurrentDateString,
    getDebitCreditValues,
    TransactionType,
    TransactionStatus
} from './transactionTypes';
import {
    calculateNewTransactionBalance,
    recalculateAllBalances
} from './balanceService';

export interface AddTransactionResult {
    success: boolean;
    transactionId?: string;
    balanceAfter?: number;
    error?: string;
}

/**
 * Add a new transaction for a user
 * 
 * Process:
 * 1. Generate unique transaction ID
 * 2. Calculate balance_after based on position in timeline
 * 3. Insert the transaction
 * 4. Recalculate all subsequent transactions (if inserted in middle)
 * 5. Update user's final balance
 */
export async function addTransaction(input: AddTransactionInput): Promise<AddTransactionResult> {
    try {
        // Validate required fields
        if (!input.user_id || !input.transaction_type || !input.amount) {
            return { success: false, error: 'Missing required fields: user_id, transaction_type, amount' };
        }

        if (input.amount <= 0) {
            return { success: false, error: 'Amount must be greater than 0' };
        }

        // Generate transaction metadata
        const transactionId = generateTransactionId();
        const transactionDate = input.transaction_date || getCurrentDateString();
        const transactionTime = getCurrentTimeString();
        const status: TransactionStatus = input.status || 'success';

        // Calculate the balance_after for this transaction
        const balanceAfter = await calculateNewTransactionBalance(
            input.user_id,
            transactionDate,
            transactionTime,
            input.amount,
            input.transaction_type,
            status
        );

        // Get debit/credit column values
        const { debit, credit } = getDebitCreditValues(input.amount, input.transaction_type);

        // Insert the transaction
        const { data, error } = await supabase
            .from('user_transactions')
            .insert({
                user_id: input.user_id,
                transaction_id: transactionId,
                transaction_date: transactionDate,
                transaction_time: transactionTime,
                transaction_type: input.transaction_type,
                amount: input.amount,
                debit: debit,
                credit: credit,
                balance_after: balanceAfter,
                status: status,
                narration: input.narration,
                description: input.description || '', // Keep description empty if not provided
                beneficiary_name: input.beneficiary_name,
                category: input.category,
                remarks: input.remarks,
                reference_number: input.reference_number
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        // Recalculate all balances to ensure consistency
        // This handles the case where we inserted in the middle of the timeline
        await recalculateAllBalances(input.user_id);

        return {
            success: true,
            transactionId: transactionId,
            balanceAfter: balanceAfter
        };

    } catch (error: any) {
        console.error('Error adding transaction:', error);
        return { success: false, error: error.message || 'Unknown error occurred' };
    }
}

/**
 * Validate transaction input before adding
 */
export function validateAddTransactionInput(input: Partial<AddTransactionInput>): string[] {
    const errors: string[] = [];

    if (!input.user_id) {
        errors.push('User ID is required');
    }

    if (!input.transaction_type) {
        errors.push('Transaction type is required');
    }

    if (!input.amount || input.amount <= 0) {
        errors.push('Amount must be greater than 0');
    }

    if (!input.narration || input.narration.trim() === '') {
        errors.push('Narration is required');
    }

    if (!input.reference_number || input.reference_number.trim() === '') {
        errors.push('Reference number is required');
    }

    return errors;
}
