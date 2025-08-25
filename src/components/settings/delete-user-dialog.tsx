
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { User } from "@/lib/types";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  userToDelete: User | null;
}

export default function DeleteUserDialog({ isOpen, onOpenChange, onDelete, userToDelete }: DeleteUserDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent dir="rtl">
            <AlertDialogHeader className="text-right">
            <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
            <AlertDialogDescription>
                سيؤدي هذا الإجراء إلى حذف المستخدم <strong className="font-bold">{userToDelete?.name}</strong> بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse">
              <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                  نعم، قم بالحذف
              </AlertDialogAction>
              <AlertDialogCancel>تراجع</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
