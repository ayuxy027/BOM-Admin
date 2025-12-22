
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUserAdded: () => void;
    children?: React.ReactNode;
}

export function AddUserDialog({ open, onOpenChange, onUserAdded, children }: AddUserDialogProps) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting, isValid } } = useForm({ mode: 'onChange' });

    const onSubmit = async (data: any) => {
        try {
            // 1. Insert into users table
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert({
                    account_number: data.account_number,
                    mpin: data.mpin,
                    username: data.username,
                    status: data.status
                })
                .select()
                .single();

            if (userError) throw userError;

            // 2. Insert into user_details table
            const { error: detailsError } = await supabase
                .from('user_details')
                .insert({
                    user_id: newUser.id,
                    account_holder_name: data.account_holder_name,
                    account_type: data.account_type,
                    balance: parseFloat(data.balance),
                    customer_id: data.customer_id,
                    email: data.email,
                    mobile_number: data.mobile_number,
                    address: data.address,
                    ifsc_code: data.ifsc_code,
                    branch_name: data.branch_name,
                    mode_of_operation: data.mode_of_operation,
                    mmid: data.mmid,
                    uncleared_balance: parseFloat(data.uncleared_balance || '0'),
                    amount_on_hold: parseFloat(data.amount_on_hold || '0'),
                    monthly_average_balance: parseFloat(data.monthly_average_balance || '0'),
                    nominee_name: data.nominee_name,
                    date_of_birth: data.date_of_birth,
                    pan_number: data.pan_number,
                    aadhar_number: data.aadhar_number,
                    relation_with_nominee: data.relation_with_nominee,
                    account_open_date: data.account_open_date
                });

            if (detailsError) {
                // Rollback user creation (manual since no transaction support in client-side REST without functions)
                await supabase.from('users').delete().eq('id', newUser.id);
                throw detailsError;
            }

            toast.success('User added successfully');
            reset();
            onOpenChange(false);
            onUserAdded();
        } catch (error: any) {
            console.error('Error adding user:', error);
            toast.error('Failed to add user: ' + error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account and profile.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
                            <Input id="username" {...register('username', { required: true })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="account_number">Account Number <span className="text-destructive">*</span></Label>
                            <Input id="account_number" {...register('account_number', { required: true })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="mpin">MPIN <span className="text-destructive">*</span></Label>
                            <Input id="mpin" type="password" maxLength={4} {...register('mpin', { required: true, minLength: 4, maxLength: 4 })} placeholder="4-digit MPIN" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select onValueChange={(v) => register('status').onChange({ target: { value: v } })} defaultValue="ACTIVE">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Register hidden input for select to work with react-hook-form smoothly or use Controller */}
                            <input type="hidden" {...register('status')} defaultValue="ACTIVE" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="account_holder_name">Full Name <span className="text-destructive">*</span></Label>
                        <Input id="account_holder_name" {...register('account_holder_name', { required: true })} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="customer_id">Customer ID <span className="text-destructive">*</span></Label>
                        <Input
                            id="customer_id"
                            {...register('customer_id', { required: true })}
                            className="font-mono"
                            placeholder="e.g., CUST_12345"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="account_type">Account Type</Label>
                            <Select onValueChange={(v) => register('account_type').onChange({ target: { value: v } })} defaultValue="SAVINGS">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SAVINGS">Savings</SelectItem>
                                    <SelectItem value="CURRENT">Current</SelectItem>
                                </SelectContent>
                            </Select>
                            <input type="hidden" {...register('account_type')} defaultValue="SAVINGS" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="balance">Opening Balance <span className="text-destructive">*</span></Label>
                            <Input id="balance" type="number" step="0.01" {...register('balance', { required: "Opening Balance is required" })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobile_number">Mobile</Label>
                            <Input id="mobile_number" {...register('mobile_number')} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" {...register('address')} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="ifsc_code">IFSC Code</Label>
                            <Input id="ifsc_code" {...register('ifsc_code')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="branch_name">Branch Name</Label>
                            <Input id="branch_name" {...register('branch_name')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="mode_of_operation">Mode of Operation</Label>
                            <Input id="mode_of_operation" {...register('mode_of_operation')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mmid">MMID</Label>
                            <Input id="mmid" {...register('mmid')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="uncleared_balance">Uncleared Bal</Label>
                            <Input id="uncleared_balance" type="number" step="0.01" {...register('uncleared_balance')} defaultValue="0" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount_on_hold">Hold Amount</Label>
                            <Input id="amount_on_hold" type="number" step="0.01" {...register('amount_on_hold')} defaultValue="0" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="monthly_average_balance">MAB</Label>
                            <Input id="monthly_average_balance" type="number" step="0.01" {...register('monthly_average_balance')} defaultValue="0" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date_of_birth">Date of Birth <span className="text-destructive">*</span></Label>
                            <Input id="date_of_birth" type="date" {...register('date_of_birth', { required: "Date of Birth is required" })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="account_open_date">Account Open Date <span className="text-destructive">*</span></Label>
                            <Input id="account_open_date" type="date" {...register('account_open_date', { required: true })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="pan_number">PAN Number</Label>
                            <Input
                                id="pan_number"
                                {...register('pan_number')}
                                className="font-mono uppercase"
                                placeholder="ABCDE1234F"
                                maxLength={10}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="aadhar_number">Aadhar Number</Label>
                            <Input
                                id="aadhar_number"
                                {...register('aadhar_number')}
                                className="font-mono"
                                placeholder="1234 5678 9012"
                                maxLength={12}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nominee_name">Nominee Name</Label>
                            <Input id="nominee_name" {...register('nominee_name')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="relation_with_nominee">Relation with Nominee</Label>
                            <Input
                                id="relation_with_nominee"
                                {...register('relation_with_nominee')}
                                placeholder="e.g., Spouse, Child, Parent"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={!isValid || isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
