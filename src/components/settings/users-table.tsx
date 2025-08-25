
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { MoreHorizontal, ShieldCheck, Pencil, Trash2, KeyRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const roleColors: Record<User['role'], string> = {
    'مدير النظام': 'bg-primary/20 text-primary-foreground border-primary/30',
    'موظف استقبال': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    'طبيب': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
}


export default function UsersTable({ 
    users, 
    onEdit,
    onEditPermissions,
    onDelete,
    onResetPassword
}: { 
    users: User[], 
    onEdit: (user: User) => void,
    onEditPermissions: (user: User) => void,
    onDelete: (user: User) => void,
    onResetPassword: (user: User) => void
}) {
  return (
    <div className="border rounded-lg">
    <Table dir="rtl">
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">المستخدم</TableHead>
          <TableHead className="text-right">البريد الإلكتروني</TableHead>
          <TableHead className="text-right">الدور</TableHead>
           <TableHead className="text-left">الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.phone}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
                <Badge variant="outline" className={roleColors[user.role]}>
                    {user.role}
                </Badge>
            </TableCell>
             <TableCell className="text-left">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Pencil className="me-2 h-4 w-4" />
                    <span>Edit User</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditPermissions(user)}>
                    <ShieldCheck className="me-2 h-4 w-4" />
                    <span>Edit Permissions</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onResetPassword(user)}>
                    <KeyRound className="me-2 h-4 w-4" />
                    <span>Reset Password</span>
                  </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-500 focus:text-red-500">
                    <Trash2 className="me-2 h-4 w-4" />
                    <span>Delete User</span>
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
