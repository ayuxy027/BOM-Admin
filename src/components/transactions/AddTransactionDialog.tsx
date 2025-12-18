
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { addTransaction, TransactionType, getCurrentDateString } from '@/services';

interface AddTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTransactionAdded: () => void;
    defaultUserId?: string;
}

export function AddTransactionDialog({ open, onOpenChange, onTransactionAdded, defaultUserId }: AddTransactionDialogProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting, isValid } } = useForm({ mode: 'onChange' });
    const transactionType = watch('transaction_type');

    useEffect(() => {
        if (open && defaultUserId) {
            setValue('user_id', defaultUserId);
        }
        if (open) {
            // Set default values for select fields
            setValue('transaction_type', 'DEBIT');
        }
    }, [open, defaultUserId, setValue]);

    const onSubmit = async (data: any) => {
        try {
            const result = await addTransaction({
                user_id: data.user_id,
                transaction_date: data.transaction_date || getCurrentDateString(),
                transaction_type: data.transaction_type as TransactionType,
                amount: parseFloat(data.amount),
                narration: data.narration,
                description: data.description,
                beneficiary_name: data.beneficiary_name,
                reference_number: data.reference_number,
                status: 'success'
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success('Transaction added successfully');
            reset();
            onOpenChange(false);
            onTransactionAdded();
        } catch (error: any) {
            console.error('Error adding transaction:', error);
            toast.error('Failed to add transaction: ' + error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <input
                        type="hidden"
                        {...register('user_id', { required: true })}
                        value={defaultUserId}
                    />

                    <div className="grid gap-2">
                        <Label>Transaction Date</Label>
                        <Input
                            type="date"
                            {...register('transaction_date')}
                            defaultValue={getCurrentDateString()}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Type <span className="text-destructive">*</span></Label>
                            <Select value={transactionType} onValueChange={(v) => setValue('transaction_type', v, { shouldValidate: true })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DEBIT">Debit</SelectItem>
                                    <SelectItem value="CREDIT">Credit</SelectItem>
                                    <SelectItem value="TRANSFER_OUT">Transfer Out</SelectItem>
                                    <SelectItem value="TRANSFER_IN">Transfer In</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Amount <span className="text-destructive">*</span></Label>
                            <Input type="number" step="0.01" {...register('amount', { required: true })} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Narration <span className="text-destructive">*</span></Label>
                        <Input {...register('narration', { required: true })} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Refrence no <span className="text-destructive">*</span></Label>
                        <Input {...register('reference_number', { required: true })} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Description (Optional)</Label>
                        <Input {...register('description')} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Beneficiary Name (Optional)</Label>
                        <Input {...register('beneficiary_name')} />
                    </div>



                    <DialogFooter>
                        <Button type="submit" disabled={!isValid || isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Transaction'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
