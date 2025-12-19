import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { User } from '@/types';
import { AccountTypeBadge } from './AccountTypeBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { LoadingAnimation } from '@/components/ui/LoadingAnimation';

interface UsersTableProps {
  users: User[];
  loading?: boolean;

  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  deletingUserId?: string | null;
}

// ... SortField and SortDirection definitions ...
type SortField = 'name' | 'balance' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function UsersTable({ users, loading, onEditUser, onDeleteUser, deletingUserId }: UsersTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'name') return (a.account_holder_name || a.username || '').localeCompare(b.account_holder_name || b.username || '') * modifier;
    if (sortField === 'balance') return (a.balance - b.balance) * modifier;
    if (sortField === 'createdAt') return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * modifier;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ?
      <ChevronUp className="h-4 w-4 ml-1" /> :
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-x-auto">
      <Table>
        <TableHeader>
          {/* ... table header content ... */}
          <TableRow className="bg-secondary/30 hover:bg-secondary/30">
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                User <SortIcon field="name" />
              </div>
            </TableHead>
            <TableHead className="hidden lg:table-cell">Account Number</TableHead>
            <TableHead className="hidden lg:table-cell">Customer ID</TableHead>
            <TableHead>MPIN</TableHead>
            <TableHead className="hidden md:table-cell">Account Type</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort('balance')}
            >
              <div className="flex items-center">
                Balance <SortIcon field="balance" />
              </div>
            </TableHead>
            <TableHead className="hidden lg:table-cell">Location</TableHead>
            <TableHead
              className="cursor-pointer select-none hidden md:table-cell"
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center">
                Created <SortIcon field="createdAt" />
              </div>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-48">
                <LoadingAnimation size={150} />
              </TableCell>
            </TableRow>
          ) : sortedUsers.map((user) => (
            <TableRow
              key={user.id}
              className="transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {(user.account_holder_name || user.username || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-card-foreground">{user.account_holder_name || user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email || user.mobile_number}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="font-mono text-sm">{user.account_number}</span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="font-mono text-sm text-muted-foreground">{user.customer_id}</span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm bg-secondary/50 px-2 py-1 rounded">{user.mpin || '------'}</span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <AccountTypeBadge type={user.account_type} />
              </TableCell>
              <TableCell className="font-medium">
                ₹{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-muted-foreground hidden lg:table-cell">{user.location || user.address || 'N/A'}</TableCell>
              <TableCell className="text-muted-foreground hidden md:table-cell">{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">

                    <DropdownMenuItem onClick={() => onEditUser(user)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDeleteUser(user)}
                      disabled={deletingUserId === user.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deletingUserId === user.id ? 'Deleting...' : 'Delete User'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
