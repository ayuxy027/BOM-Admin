
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Beneficiary } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { LoadingAnimation } from '@/components/ui/LoadingAnimation';
import { AddBeneficiaryDialog } from '@/components/beneficiaries/AddBeneficiaryDialog';
import { EditBeneficiaryDialog } from '@/components/beneficiaries/EditBeneficiaryDialog';
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

export default function BeneficiariesPage() {
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editBeneficiary, setEditBeneficiary] = useState<Beneficiary | null>(null);

    useEffect(() => {
        if (selectedUserId) {
            fetchBeneficiaries();
        } else {
            setBeneficiaries([]);
        }
    }, [selectedUserId]);

    const fetchBeneficiaries = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_beneficiaries')
                .select('*')
                .eq('user_id', selectedUserId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBeneficiaries(data as any);
        } catch (error) {
            console.error('Error fetching beneficiaries:', error);
            toast.error('Failed to fetch beneficiaries');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (data: Beneficiary) => {
        if (!confirm('Are you sure you want to delete this beneficiary?')) return;
        try {
            const { error } = await supabase
                .from('user_beneficiaries')
                .delete()
                .eq('id', data.id);

            if (error) throw error;
            toast.success('Beneficiary deleted');
            fetchBeneficiaries();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Failed to delete beneficiary');
        }
    };

    const filteredBeneficiaries = useMemo(() => {
        return beneficiaries.filter(ben => {
            const searchLower = searchQuery.toLowerCase();
            return (
                (ben.beneficiary_name || '').toLowerCase().includes(searchLower) ||
                (ben.account_number || '').toLowerCase().includes(searchLower)
            );
        });
    }, [beneficiaries, searchQuery]);

    const paginatedBeneficiaries = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBeneficiaries.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredBeneficiaries, currentPage]);

    const totalPages = Math.ceil(filteredBeneficiaries.length / ITEMS_PER_PAGE);

    return (
        <DashboardLayout title="Beneficiaries" subtitle="Select a user to manage their beneficiaries">
            <div className="space-y-6">


                {/* User Selection */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-card border rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <span className="text-sm font-medium whitespace-nowrap">Select User:</span>
                        <UserSelect value={selectedUserId} onChange={setSelectedUserId} />
                    </div>
                    {selectedUserId && (
                        <Button onClick={() => setIsAddOpen(true)} className="w-full md:w-auto">
                            <Plus className="h-4 w-4 mr-2" /> Add Beneficiary
                        </Button>
                    )}
                </div>

                {selectedUserId ? (
                    <>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Search beneficiaries..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-card rounded-xl border shadow-sm overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Acc No</TableHead>
                                        <TableHead className="hidden md:table-cell">Bank</TableHead>
                                        <TableHead className="hidden lg:table-cell">IFSC</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-48">
                                                <LoadingAnimation size={150} />
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedBeneficiaries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">No beneficiaries found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedBeneficiaries.map((ben) => (
                                            <TableRow key={ben.id}>
                                                <TableCell>{ben.beneficiary_name}</TableCell>
                                                <TableCell>{ben.account_number}</TableCell>
                                                <TableCell className="hidden md:table-cell">{ben.bank_name}</TableCell>
                                                <TableCell className="hidden lg:table-cell">{ben.ifsc_code}</TableCell>
                                                <TableCell>
                                                    <Badge variant={ben.is_active ? 'default' : 'secondary'}>
                                                        {ben.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => setEditBeneficiary(ben)}>
                                                                <Edit className="h-4 w-4 mr-2" /> Edit Beneficiary
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(ben)}>
                                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
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
                                {Math.min(currentPage * ITEMS_PER_PAGE, filteredBeneficiaries.length)} of{' '}
                                {filteredBeneficiaries.length} results
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
                        <p className="text-muted-foreground mb-4">Please select a user from the dropdown above to view their beneficiaries.</p>
                    </div>
                )}

                <AddBeneficiaryDialog
                    open={isAddOpen}
                    onOpenChange={setIsAddOpen}
                    onBeneficiaryAdded={fetchBeneficiaries}
                    defaultUserId={selectedUserId}
                />

                <EditBeneficiaryDialog
                    beneficiary={editBeneficiary}
                    open={!!editBeneficiary}
                    onOpenChange={(open) => !open && setEditBeneficiary(null)}
                    onBeneficiaryUpdated={fetchBeneficiaries}
                />
            </div>
        </DashboardLayout>
    );
}
