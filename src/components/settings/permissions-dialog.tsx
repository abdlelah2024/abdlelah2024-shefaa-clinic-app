
'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { allPermissions } from "@/lib/data";
import type { User, Permission } from "@/lib/types";
import type { UseFormReturn } from "react-hook-form";
import type { UserFormValues } from "@/app/(app)/settings/page";

interface PermissionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<UserFormValues>;
  onSubmit: () => void;
  selectedUser: User | null;
}

export default function PermissionsDialog({ isOpen, onOpenChange, form, onSubmit, selectedUser }: PermissionsDialogProps) {
  const { watch, setValue } = form;

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    const currentPermissions = watch('permissions') || [];
    let updatedPermissions: Permission[];
    if (checked) {
        updatedPermissions = [...currentPermissions, permission];
    } else {
        updatedPermissions = currentPermissions.filter(p => p !== permission);
    }
    setValue('permissions', updatedPermissions);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle>تعديل صلاحيات المستخدم</DialogTitle>
            <DialogDescription>
              تغيير صلاحيات المستخدم: <span className="font-bold">{selectedUser?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-4 max-h-80 overflow-y-auto px-2 text-right">
            {allPermissions.map(permission => (
              <div key={permission.id} className="flex items-center space-x-2 space-x-reverse">
                 <Label htmlFor={`perm-${permission.id}`} className="cursor-pointer flex-1">
                  {permission.label}
                </Label>
                <Checkbox
                  id={`perm-${permission.id}`}
                  checked={watch('permissions')?.includes(permission.id)}
                  onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                />
              </div>
            ))}
          </div>
          <DialogFooter className="flex-row-reverse">
             <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button onClick={onSubmit}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
