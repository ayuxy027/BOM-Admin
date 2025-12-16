
import { useState, useMemo } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { UsersTable } from '@/components/users/UsersTable';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { AddUserDialog } from '@/components/users/AddUserDialog';

import { EditUserDialog } from '@/components/users/EditUserDialog';
import { User } from '@/types';

const ITEMS_PER_PAGE = 10;

import { DashboardLayout } from '@/components/layout/DashboardLayout';

// ...

export default function UsersPage() {
  const { users, loading, error, refetch } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  // Removed statusFilter and typeFilter state init if you want them gone from logic too, but keeping minimal edits for now.

  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = (user.account_holder_name || user.username || '').toLowerCase().includes(searchLower);
      const emailMatch = (user.email || user.mobile_number || '').toLowerCase().includes(searchLower);
      // Removed status/type filter logic if requested to remove ALL filters, 
      // but user said "remove all status and all types filter" referencing the UI dropdowns.
      // I will keep the logic simplified or just leave it since the UI controls are gone.
      return nameMatch || emailMatch;
    });
  }, [users, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const handleEditUser = (user: User) => {
    setSelectedUserForEdit(user);
  };

  return (
    <DashboardLayout title="User Management" subtitle="Manage, monitor, and edit user accounts">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <AddUserDialog
            open={isAddUserOpen}
            onOpenChange={setIsAddUserOpen}
            onUserAdded={refetch}
          >
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </AddUserDialog>
        </div>

        {/* Table */}
        <UsersTable
          users={paginatedUsers}
          loading={loading}
          onEditUser={handleEditUser}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{' '}
            {filteredUsers.length} users
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

        <EditUserDialog
          user={selectedUserForEdit}
          open={!!selectedUserForEdit}
          onOpenChange={(open) => !open && setSelectedUserForEdit(null)}
          onUserUpdated={refetch}
        />
      </div>
    </DashboardLayout>
  );
}
