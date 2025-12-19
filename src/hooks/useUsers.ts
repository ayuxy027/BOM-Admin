
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Fetch users and their details using join
            const { data, error } = await supabase
                .from('users')
                .select(`
          *,
          user_details (*)
        `);

            if (error) throw error;

            // Transform data to match User interface
            const transformedUsers: User[] = (data || []).map((u: any) => {
                const details = u.user_details?.[0] || {}; // Assuming 1:1, but supabase returns array for 1:N or 1:1 usually unless single() is used on join (not possible always)
                // Check if user_details is an object or array. select(*) usually implies array if not single relation.
                // Actually, if it's 1:1, it might still return array depending on how foreign keys are set up.
                // Let's assume array for safety: details[0]

                // Wait, 'user_details (*)' returns an object if the relation is one-to-one defined in supabase?
                // Usually it returns an array unless specified.
                // Let's safe check.
                const d = Array.isArray(u.user_details) ? u.user_details[0] : u.user_details;

                return {
                    id: u.id,
                    account_number: u.account_number,
                    username: u.username,
                    mpin: u.mpin || '',
                    status: u.status,
                    created_at: u.created_at,

                    account_holder_name: d?.account_holder_name || '',
                    account_type: d?.account_type || 'SAVINGS',
                    balance: Number(d?.balance) || 0,
                    customer_id: d?.customer_id || '',
                    email: d?.email || '',
                    mobile_number: d?.mobile_number || '',
                    address: d?.address || '',
                    location: d?.address || '',
                    lastLogin: u.updated_at,

                    // Extended Details
                    mode_of_operation: d?.mode_of_operation || 'OPERATING SINGLY',
                    uncleared_balance: Number(d?.uncleared_balance) || 0,
                    amount_on_hold: Number(d?.amount_on_hold) || 0,
                    mmid: d?.mmid || '',
                    monthly_average_balance: Number(d?.monthly_average_balance) || 0,
                    account_open_date: d?.account_open_date,
                    ifsc_code: d?.ifsc_code || '',
                    branch_name: d?.branch_name || '',
                    date_of_birth: d?.date_of_birth,
                    pan_number: d?.pan_number || '',
                    aadhar_number: d?.aadhar_number || '',
                    nominee_name: d?.nominee_name || '',
                    relation_with_nominee: d?.relation_with_nominee || ''
                };
            });

            setUsers(transformedUsers);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading, error, refetch: fetchUsers };
}
