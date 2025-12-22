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
    calculateImpact,
    calculateImpactLegacy,
    getUserInitialBalance
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
    original: { amount: number; transaction_type: string; status: string; debit: number | null; credit: number | null },
    updated: EditTransactionInput
): boolean {
    // Operation type changed? (credit to debit or vice versa)
    if (updated.operation_type) {
        const wasCredit = original.credit && original.credit > 0;
        const isCredit = updated.operation_type === 'credit';
        if (wasCredit !== isCredit) {
            return true;
        }
    }

    // Type changed? - REMOVED as per request to avoid unnecessary recalculations
    // We rely on operation_type for direction. Changing just the label (e.g. IMPS -> NEFT) keeps same impact.
    // if (updated.transaction_type && updated.transaction_type !== original.transaction_type) {
    //     return true;
    // }

    // Amount changed? (Use epsilon for float comparison)
    if (updated.amount !== undefined) {
        const diff = Math.abs(updated.amount - original.amount);
        if (diff > 0.01) { // 1 cent difference triggers update
            return true;
        }
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
 * 2. Determine if changes impact balance (type, amount, status, operation)
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

        // Calculate true initial balance BEFORE update if we are going to recalculate
        // This is critical because if we edit the first transaction, getUserInitialBalance (which reads from DB)
        // will use the NEW amount with the OLD balance_after, leading to wrong initial balance derivation.
        let trueInitialBalance: number | undefined;
        if (needsRecalculation) {
            // We can rely on getUserInitialBalance here because the DB is still in "Original" state
            // So reverse-calculation (balance_after - amount) will be correct.
            // UNLESS the transaction being edited IS the first one, but getUserInitialBalance handles finding the first one.
            // Since we haven't touched DB yet, it finds the original first one and calculates correctly.
            trueInitialBalance = await getUserInitialBalance(original.user_id);
        }

        // Build the update object
        const updateData: any = {};

        // Handle operation_type and/or amount changes
        if (updates.operation_type || updates.amount !== undefined) {
            const operationType = updates.operation_type || (original.credit && original.credit > 0 ? 'credit' : 'debit');
            const amount = updates.amount ?? original.amount;
            const { debit, credit } = getDebitCreditValues(amount, operationType);
            updateData.debit = debit;
            updateData.credit = credit;
            updateData.amount = amount;
        }

        if (updates.transaction_type) {
            updateData.transaction_type = updates.transaction_type;
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
        if (needsRecalculation && trueInitialBalance !== undefined) { // Check trueInitialBalance exists to satisfy TS
            const result = await recalculateAllBalances(original.user_id, trueInitialBalance);
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
    const originalImpact = calculateImpactLegacy(originalAmount, originalType, originalStatus);
    const newImpact = calculateImpactLegacy(newAmount, newType, newStatus);

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
