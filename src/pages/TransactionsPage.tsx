
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { LoadingAnimation } from '@/components/ui/LoadingAnimation';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { EditTransactionDialog } from '@/components/transactions/EditTransactionDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserSelect } from '@/components/users/UserSelect';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
    const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

    useEffect(() => {
        if (selectedUserId) {
            fetchTransactions();
        } else {
            setTransactions([]);
        }
    }, [selectedUserId]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_transactions')
                .select('*')
                .eq('user_id', selectedUserId)
                .order('transaction_date', { ascending: false })
                .order('transaction_time', { ascending: false });

            if (error) throw error;
            setTransactions(data as any);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (data: Transaction) => {
        setDeletingTxId(data.id);
        try {
            const { deleteTransaction } = await import('@/services');
            const result = await deleteTransaction(data.id);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success('Transaction deleted');
            fetchTransactions();
        } catch (error: any) {
            console.error('Error deleting:', error);
            toast.error('Failed to delete transaction');
        } finally {
            setDeletingTxId(null);
        }
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesSearch =
                (tx.narration || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tx.transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tx.reference_number || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = typeFilter === 'all' || tx.transaction_type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [transactions, searchQuery, typeFilter]);

    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTransactions, currentPage]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    return (
        <DashboardLayout title="Transactions" subtitle="Select a user to manage their transactions">
            <div className="space-y-6">


                {/* User Selection */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-card border rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <span className="text-sm font-medium whitespace-nowrap">Select User:</span>
                        <UserSelect value={selectedUserId} onChange={setSelectedUserId} />
                    </div>
                    {selectedUserId && (
                        <Button onClick={() => setIsAddOpen(true)} className="w-full md:w-auto">
                            <Plus className="h-4 w-4 mr-2" /> Add Transaction
                        </Button>
                    )}
                </div>

                {selectedUserId ? (
                    <>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="DEBIT">Debit</SelectItem>
                                    <SelectItem value="CREDIT">Credit</SelectItem>
                                    <SelectItem value="TRANSFER_OUT">Transfer Out</SelectItem>
                                    <SelectItem value="TRANSFER_IN">Transfer In</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-card rounded-xl border shadow-sm overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Narration</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-48">
                                                <LoadingAnimation size={150} />
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedTransactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">No transactions found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedTransactions.map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell>{new Date(tx.transaction_date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{tx.transaction_type}</Badge>
                                                </TableCell>
                                                <TableCell>{tx.narration}</TableCell>
                                                <TableCell className={tx.transaction_type === 'CREDIT' || tx.transaction_type === 'TRANSFER_IN' ? 'text-green-600' : 'text-red-600'}>
                                                    {tx.transaction_type === 'CREDIT' || tx.transaction_type === 'TRANSFER_IN' ? '+' : '-'}₹{tx.amount}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => setEditTransaction(tx)}>
                                                                <Edit className="h-4 w-4 mr-2" /> Edit Transaction
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleDelete(tx)}
                                                                disabled={deletingTxId === tx.id}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                {deletingTxId === tx.id ? 'Deleting...' : 'Delete'}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                                {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of{' '}
                                {filteredTransactions.length} results
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium px-2">
                                    Page {currentPage} of {totalPages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-card/50">
                        <h3 className="text-lg font-semibold mb-2">No User Selected</h3>
                        <p className="text-muted-foreground mb-4">Please select a user from the dropdown above to view their transactions.</p>
                    </div>
                )}

                <AddTransactionDialog
                    open={isAddOpen}
                    onOpenChange={setIsAddOpen}
                    onTransactionAdded={fetchTransactions}
                    defaultUserId={selectedUserId}
                />

                <EditTransactionDialog
                    transaction={editTransaction}
                    open={!!editTransaction}
                    onOpenChange={(open) => !open && setEditTransaction(null)}
                    onTransactionUpdated={fetchTransactions}
                />
            </div>
        </DashboardLayout>
    );
}
