
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@/types';

interface EditUserDialogProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUserUpdated: () => void;
}

export function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

    useEffect(() => {
        if (user) {
            setValue('account_number', user.account_number);
            setValue('username', user.username);
            setValue('mpin', user.mpin);
            setValue('status', user.status);
            setValue('account_holder_name', user.account_holder_name);
            setValue('customer_id', user.customer_id);
            setValue('account_type', user.account_type);
            setValue('email', user.email);
            setValue('mobile_number', user.mobile_number);
            setValue('address', user.address);
            setValue('balance', user.balance);

            // Extended fields
            setValue('mode_of_operation', user.mode_of_operation);
            setValue('uncleared_balance', user.uncleared_balance);
            setValue('amount_on_hold', user.amount_on_hold);
            setValue('mmid', user.mmid);
            setValue('monthly_average_balance', user.monthly_average_balance);
            setValue('ifsc_code', user.ifsc_code);
            setValue('branch_name', user.branch_name);
            setValue('account_open_date', user.account_open_date);
            setValue('nominee_name', user.nominee_name);
            setValue('date_of_birth', user.date_of_birth);
            setValue('pan_number', user.pan_number);
            setValue('aadhar_number', user.aadhar_number);
            setValue('relation_with_nominee', user.relation_with_nominee);
        }
    }, [user, setValue]);

    const onSubmit = async (data: any) => {
        if (!user) return;
        try {
            // Update users table
            const { error: userError } = await supabase
                .from('users')
                .update({
                    account_number: data.account_number,
                    username: data.username,
                    mpin: data.mpin,
                    status: data.status
                })
                .eq('id', user.id);

            if (userError) throw userError;

            // Update user_details table
            const { error: detailsError } = await supabase
                .from('user_details')
                .update({
                    account_holder_name: data.account_holder_name,
                    customer_id: data.customer_id,
                    account_type: data.account_type,
                    email: data.email,
                    mobile_number: data.mobile_number,
                    address: data.address,
                    balance: parseFloat(data.balance),
                    mode_of_operation: data.mode_of_operation,
                    uncleared_balance: parseFloat(data.uncleared_balance || '0'),
                    amount_on_hold: parseFloat(data.amount_on_hold || '0'),
                    mmid: data.mmid,
                    monthly_average_balance: parseFloat(data.monthly_average_balance || '0'),
                    ifsc_code: data.ifsc_code,
                    branch_name: data.branch_name,
                    nominee_name: data.nominee_name,
                    date_of_birth: data.date_of_birth,
                    pan_number: data.pan_number,
                    aadhar_number: data.aadhar_number,
                    relation_with_nominee: data.relation_with_nominee,
                    // account_open_date is usually set on creation, but we can allow edit if needed.
                    // keeping it read-only in UI might be better, but user said "added and manipulated", so let's allow edit.
                    account_open_date: data.account_open_date
                })
                .eq('user_id', user.id);

            if (detailsError) throw detailsError;

            toast.success('User updated successfully');
            onOpenChange(false);
            onUserUpdated();
        } catch (error: any) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label>Username</Label>
                            <Input {...register('username')} />
                        </div>
                        <div className="grid gap-2">
                            <Label>MPIN</Label>
                            <Input
                                {...register('mpin', { minLength: 4, maxLength: 4 })}
                                maxLength={4}
                                placeholder="4-digit MPIN"
                                className="font-mono"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select onValueChange={(v) => setValue('status', v)} defaultValue={user?.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Account Number *</Label>
                        <Input
                            {...register('account_number', { required: true })}
                            className="font-mono"
                            placeholder="Account Number"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Full Name</Label>
                        <Input {...register('account_holder_name')} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Customer ID *</Label>
                        <Input
                            {...register('customer_id', { required: true })}
                            className="font-mono"
                            placeholder="Customer ID"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Account Type</Label>
                            <Select onValueChange={(v) => setValue('account_type', v)} defaultValue={user?.account_type}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SAVINGS">Savings</SelectItem>
                                    <SelectItem value="CURRENT">Current</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Balance</Label>
                            <Input type="number" step="0.01" {...register('balance')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input {...register('email')} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Mobile</Label>
                            <Input {...register('mobile_number')} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Address</Label>
                        <Input {...register('address')} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>IFSC Code</Label>
                            <Input {...register('ifsc_code')} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Branch Name</Label>
                            <Input {...register('branch_name')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Mode of Operation</Label>
                            <Input {...register('mode_of_operation')} />
                        </div>
                        <div className="grid gap-2">
                            <Label>MMID</Label>
                            <Input {...register('mmid')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label>Uncleared Bal</Label>
                            <Input type="number" step="0.01" {...register('uncleared_balance')} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Hold Amount</Label>
                            <Input type="number" step="0.01" {...register('amount_on_hold')} />
                        </div>
                        <div className="grid gap-2">
                            <Label>MAB</Label>
                            <Input type="number" step="0.01" {...register('monthly_average_balance')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Date of Birth</Label>
                            <Input type="date" {...register('date_of_birth')} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Account Open Date</Label>
                            <Input type="date" {...register('account_open_date')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>PAN Number</Label>
                            <Input
                                {...register('pan_number')}
                                className="font-mono uppercase"
                                placeholder="ABCDE1234F"
                                maxLength={10}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Aadhar Number</Label>
                            <Input
                                {...register('aadhar_number')}
                                className="font-mono"
                                placeholder="1234 5678 9012"
                                maxLength={12}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Nominee Name</Label>
                            <Input {...register('nominee_name')} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Relation with Nominee</Label>
                            <Input
                                {...register('relation_with_nominee')}
                                placeholder="e.g., Spouse, Child, Parent"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
