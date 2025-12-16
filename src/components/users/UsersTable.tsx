import { useState } from 'react';
import { MoreHorizontal, Eye, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { User } from '@/types';
import { UserStatusBadge } from './UserStatusBadge';
import { AccountTypeBadge } from './AccountTypeBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

interface UsersTableProps {
  users: User[];
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
}

type SortField = 'name' | 'balance' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function UsersTable({ users, selectedUsers, onSelectUser, onSelectAll }: UsersTableProps) {
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
    if (sortField === 'name') return a.name.localeCompare(b.name) * modifier;
    if (sortField === 'balance') return (a.balance - b.balance) * modifier;
    if (sortField === 'createdAt') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * modifier;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/30 hover:bg-secondary/30">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedUsers.length === users.length}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                User <SortIcon field="name" />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Account Type</TableHead>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => handleSort('balance')}
            >
              <div className="flex items-center">
                Balance <SortIcon field="balance" />
              </div>
            </TableHead>
            <TableHead>Location</TableHead>
            <TableHead 
              className="cursor-pointer select-none"
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
          {sortedUsers.map((user) => (
            <TableRow 
              key={user.id} 
              className={cn(
                'transition-colors',
                selectedUsers.includes(user.id) && 'bg-primary/5'
              )}
            >
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => onSelectUser(user.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-card-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <UserStatusBadge status={user.status} />
              </TableCell>
              <TableCell>
                <AccountTypeBadge type={user.accountType} />
              </TableCell>
              <TableCell className="font-medium">
                ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-muted-foreground">{user.location}</TableCell>
              <TableCell className="text-muted-foreground">{user.createdAt}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" /> Edit User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete User
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
