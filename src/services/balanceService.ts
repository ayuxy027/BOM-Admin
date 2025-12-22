/**
 * Balance Service
 * Handles all balance-related calculations and updates
 * 
 * DEPENDENCY TREE:
 * ┌─────────────────────────────────────────────────────┐
 * │ user_details.balance (FINAL BALANCE)                │
 * │     └── Computed from all transactions              │
 * │         ordered by date → time → created_at         │
 * │         filtered by status === 'success'            │
 * └─────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────┐
 * │ transaction.balance_after (RUNNING BALANCE)         │
 * │     └── Previous transaction's balance_after        │
 * │         + calculateImpact(amount, type, status)     │
 * └─────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import {
    Transaction,
    TransactionType,
    TransactionStatus,
    OperationType,
    BalanceCalculationResult,
    calculateImpact,
    calculateImpactLegacy,
    getUserInitialBalance,
    shouldImpactBalance
} from './transactionTypes';

/**
 * Update user's current balance in user_details table
 */
export async function updateUserBalance(userId: string, newBalance: number): Promise<void> {
    const { error } = await supabase
        .from('user_details')
        .update({ balance: newBalance })
        .eq('user_id', userId);

    if (error) {
        throw new Error(`Failed to update user balance: ${error.message}`);
    }
}

/**
 * Get all transactions for a user in chronological order
 */
export async function getOrderedTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('user_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: true })
        .order('transaction_time', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    return (data || []) as Transaction[];
}

/**
 * Get the balance before a specific transaction
 * This finds the most recent transaction BEFORE the given date/time
 */
export async function getBalanceBeforePosition(
    userId: string,
    transactionDate: string,
    transactionTime: string
): Promise<number> {
    // Get the transaction just before this date/time combo
    const { data, error } = await supabase
        .from('user_transactions')
        .select('balance_after')
        .eq('user_id', userId)
        .or(`transaction_date.lt.${transactionDate},and(transaction_date.eq.${transactionDate},transaction_time.lt.${transactionTime})`)
        .order('transaction_date', { ascending: false })
        .order('transaction_time', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        // No previous transaction, return initial balance
        return await getUserInitialBalance(userId);
    }

    return data.balance_after || 0;
}

/**
 * CORE FUNCTION: Recalculate all balance_after values for a user
 * 
 * This is called when:
 * - A new transaction is added (may insert in middle of timeline)
 * - A transaction is edited (amount, type, or status changed)
 * - A transaction is deleted
 * 
 * Algorithm:
 * 1. Get initial balance (before any transactions)
 * 2. Get all transactions in chronological order
 * 3. For each transaction:
 *    - If status is 'success': apply impact to running balance
 *    - Set balance_after = running balance
 * 4. Update user's final balance
 */
export async function recalculateAllBalances(userId: string, initialBalanceOverride?: number): Promise<BalanceCalculationResult> {
    let initialBalance: number;
    if (initialBalanceOverride !== undefined) {
        initialBalance = initialBalanceOverride;
    } else {
        initialBalance = await getUserInitialBalance(userId);
    }

    const transactions = await getOrderedTransactions(userId);

    if (transactions.length === 0) {
        // No transactions, just ensure user balance is set correctly
        await updateUserBalance(userId, initialBalance);
        return {
            success: true,
            previousBalance: initialBalance,
            newBalance: initialBalance,
            transactionsUpdated: 0
        };
    }

    let runningBalance = initialBalance;
    const updates: { id: string; balance_after: number }[] = [];

    // Recalculate balance for each transaction
    for (const txn of transactions) {
        // Check explicit debit/credit columns first (Source of Truth)
        let impact = 0;

        if (txn.credit && txn.credit > 0) {
            impact = txn.credit;
        } else if (txn.debit && txn.debit > 0) {
            impact = -txn.debit;
        } else {
            // Fallback to legacy calc if columns are missing
            impact = calculateImpactLegacy(
                txn.amount,
                txn.transaction_type as TransactionType,
                txn.status as TransactionStatus
            );
        }

        // Only apply impact if status is 'success'
        if (txn.status !== 'success') {
            impact = 0;
        }

        runningBalance += impact;

        // Always set balance_after (even for failed txns, they show what balance WAS)
        updates.push({
            id: txn.id,
            balance_after: runningBalance
        });
    }

    // Batch update all transactions
    for (const update of updates) {
        const { error } = await supabase
            .from('user_transactions')
            .update({ balance_after: update.balance_after })
            .eq('id', update.id);

        if (error) {
            console.error(`Failed to update transaction ${update.id}:`, error);
        }
    }

    // Update user's final balance
    await updateUserBalance(userId, runningBalance);

    return {
        success: true,
        previousBalance: initialBalance,
        newBalance: runningBalance,
        transactionsUpdated: updates.length
    };
}

/**
 * Calculate what the balance_after should be for a new transaction
 * being inserted at a specific date/time
 */
export async function calculateNewTransactionBalance(
    userId: string,
    transactionDate: string,
    transactionTime: string,
    amount: number,
    operationType: OperationType,
    status: TransactionStatus
): Promise<number> {
    const balanceBefore = await getBalanceBeforePosition(userId, transactionDate, transactionTime);
    const impact = calculateImpact(amount, operationType, status);
    return balanceBefore + impact;
}

/**
 * Smart recalculation: Only recalculate from a specific point onwards
 * Used when we know the transaction position in the timeline
 */
export async function recalculateFromDate(
    userId: string,
    fromDate: string
): Promise<BalanceCalculationResult> {
    // For simplicity and correctness, we recalculate everything
    // This ensures no edge cases are missed
    return await recalculateAllBalances(userId);
}
