/**
 * Edit Transaction Service
 * Handles updating existing transactions with proper balance recalculation
 * 
 * IMPACT ANALYSIS:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ When editing a transaction, these changes REQUIRE recalculation│
 * │                                                                  │
 * │ 1. transaction_type changed:                                    │
 * │    • From CREDIT→DEBIT (or vice versa) = Double impact!        │
 * │    • Original: +1000, New: -1000 = net change of 2000          │
 * │                                                                  │
 * │ 2. amount changed:                                              │
 * │    • Direct impact on balance_after and all subsequent          │
 * │                                                                  │
 * │ 3. status changed:                                              │
 * │    • success→failed: Remove impact from balance                │
 * │    • failed→success: Add impact to balance                     │
 * │    • This is a TOGGLE operation                                 │
 * │                                                                  │
 * │ These changes do NOT require recalculation:                     │
 * │ • narration, description, beneficiary_name (metadata only)      │
 * └─────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import {
    EditTransactionInput,
    TransactionType,
    TransactionStatus,
    getDebitCreditValues,
    calculateImpact
} from './transactionTypes';
import { recalculateAllBalances } from './balanceService';

export interface EditTransactionResult {
    success: boolean;
    requiresRecalculation: boolean;
    newUserBalance?: number;
    error?: string;
}

/**
 * Determine if the edit requires balance recalculation
 */
function checkRecalculationNeeded(
    original: { amount: number; transaction_type: string; status: string },
    updated: EditTransactionInput
): boolean {
    // Type changed?
    if (updated.transaction_type && updated.transaction_type !== original.transaction_type) {
        return true;
    }

    // Amount changed?
    if (updated.amount !== undefined && updated.amount !== original.amount) {
        return true;
    }

    // Status changed? (This is the key one often missed!)
    if (updated.status && updated.status !== original.status) {
        return true;
    }

    return false;
}

/**
 * Edit an existing transaction
 * 
 * Process:
 * 1. Fetch original transaction
 * 2. Determine if changes impact balance (type, amount, status)
 * 3. Update the transaction record
 * 4. If balance-impacting changes, recalculate all balances
 * 5. Return result with new user balance
 */
export async function editTransaction(
    transactionId: string,
    updates: EditTransactionInput
): Promise<EditTransactionResult> {
    try {
        // Fetch original transaction
        const { data: original, error: fetchError } = await supabase
            .from('user_transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (fetchError || !original) {
            return { success: false, requiresRecalculation: false, error: 'Transaction not found' };
        }

        // Check if recalculation is needed
        const needsRecalculation = checkRecalculationNeeded(original, updates);

        // Build the update object
        const updateData: any = {};

        if (updates.transaction_type) {
            updateData.transaction_type = updates.transaction_type;
            // Update debit/credit columns
            const amount = updates.amount ?? original.amount;
            const { debit, credit } = getDebitCreditValues(amount, updates.transaction_type);
            updateData.debit = debit;
            updateData.credit = credit;
        }

        if (updates.amount !== undefined) {
            updateData.amount = updates.amount;
            // Update debit/credit columns
            const type = (updates.transaction_type || original.transaction_type) as TransactionType;
            const { debit, credit } = getDebitCreditValues(updates.amount, type);
            updateData.debit = debit;
            updateData.credit = credit;
        }

        if (updates.status) {
            updateData.status = updates.status;
        }

        if (updates.narration !== undefined) {
            updateData.narration = updates.narration;
        }

        if (updates.description !== undefined) {
            updateData.description = updates.description;
        }

        if (updates.beneficiary_name !== undefined) {
            updateData.beneficiary_name = updates.beneficiary_name;
        }

        if (updates.reference_number !== undefined) {
            updateData.reference_number = updates.reference_number;
        }

        // Only proceed if there's something to update
        if (Object.keys(updateData).length === 0) {
            return { success: true, requiresRecalculation: false };
        }

        // Update the transaction
        const { error: updateError } = await supabase
            .from('user_transactions')
            .update(updateData)
            .eq('id', transactionId);

        if (updateError) {
            return { success: false, requiresRecalculation: false, error: updateError.message };
        }

        // Recalculate balances if needed
        let newUserBalance: number | undefined;
        if (needsRecalculation) {
            const result = await recalculateAllBalances(original.user_id);
            newUserBalance = result.newBalance;
        }

        return {
            success: true,
            requiresRecalculation: needsRecalculation,
            newUserBalance: newUserBalance
        };

    } catch (error: any) {
        console.error('Error editing transaction:', error);
        return {
            success: false,
            requiresRecalculation: false,
            error: error.message || 'Unknown error occurred'
        };
    }
}

/**
 * Get the balance impact difference when editing a transaction
 * Useful for showing preview of changes to user
 */
export function calculateEditImpact(
    originalAmount: number,
    originalType: TransactionType,
    originalStatus: TransactionStatus,
    newAmount: number,
    newType: TransactionType,
    newStatus: TransactionStatus
): { originalImpact: number; newImpact: number; difference: number } {
    const originalImpact = calculateImpact(originalAmount, originalType, originalStatus);
    const newImpact = calculateImpact(newAmount, newType, newStatus);

    return {
        originalImpact,
        newImpact,
        difference: newImpact - originalImpact
    };
}

/**
 * Validate edit transaction input
 */
export function validateEditTransactionInput(input: EditTransactionInput): string[] {
    const errors: string[] = [];

    if (input.amount !== undefined && input.amount <= 0) {
        errors.push('Amount must be greater than 0');
    }

    if (input.narration !== undefined && input.narration.trim() === '') {
        errors.push('Narration cannot be empty');
    }

    if (input.reference_number !== undefined && input.reference_number.trim() === '') {
        errors.push('Reference number cannot be empty');
    }

    return errors;
}
