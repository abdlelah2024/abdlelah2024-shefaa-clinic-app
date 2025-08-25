
'use client';

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { allPermissions, permissionsByRole } from "@/lib/data";
import type { User, Permission, UserRole } from "@/lib/types";
import ThemeToggle from "@/components/settings/theme-toggle";
import UsersTable from "@/components/settings/users-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, KeyRound, ShieldCheck, Loader2 } from "lucide-react";
import { useForm, SubmitHandler, useForm as usePasswordForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserDialog from "@/components/settings/user-dialog";
import PermissionsDialog from "@/components/settings/permissions-dialog";
import DeleteUserDialog from "@/components/settings/delete-user-dialog";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { db, getAuth } from '@/lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";


export type UserFormValues = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  permissions: Permission[];
};

type PasswordFormValues = {
    currentPassword: string;
    newPassword:string;
    confirmPassword: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const userForm = useForm<UserFormValues>();
  const passwordForm = useForm<PasswordFormValues>();
  
  const watchedRole = userForm.watch("role");

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersList);
        
        if (typeof window !== 'undefined') {
            const userString = localStorage.getItem('user');
            const userObject = userString ? JSON.parse(userString) : null;
            if (userObject) {
                const fullUser = usersList.find(u => u.id === userObject.id);
                setCurrentUser(fullUser || null);
            }
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        toast({ title: "خطأ", description: "لم نتمكن من جلب قائمة المستخدمين.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  useEffect(() => {
    if (isUserDialogOpen && watchedRole && !selectedUser) { // only for new user
      userForm.setValue('permissions', permissionsByRole[watchedRole]);
    }
  }, [watchedRole, isUserDialogOpen, userForm, selectedUser]);
  
  const handleOpenUserDialog = useCallback((user: User | null = null) => {
    setSelectedUser(user);
    if (user) {
      userForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions,
      });
    } else {
      userForm.reset({
        name: '',
        email: '',
        phone: '',
        role: 'موظف استقبال',
        permissions: permissionsByRole['موظف استقبال'],
      });
    }
    setIsUserDialogOpen(true);
  }, [userForm]);
  
  const handleOpenPermissionsDialog = useCallback((user: User) => {
    setSelectedUser(user);
    userForm.setValue('permissions', user.permissions);
    setIsPermissionsDialogOpen(true);
  }, [userForm]);
  
  const handleOpenDeleteDialog = useCallback((user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  }, []);
  
  const handleResetPassword = useCallback((user: User) => {
      toast({
          title: "إعادة تعيين كلمة المرور",
          description: `في تطبيق حقيقي، سيتم إرسال بريد إلكتروني لإعادة تعيين كلمة المرور للمستخدم ${user.name}.`,
      });
  }, [toast]);

  const handleSavePermissions = useCallback(async () => {
    if (!selectedUser) return;
    
    const newPermissions = userForm.getValues('permissions');
    const userDocRef = doc(db, 'users', selectedUser.id);

    try {
        await updateDoc(userDocRef, { permissions: newPermissions });
        
        const updatedUser = { ...selectedUser, permissions: newPermissions };
        if(currentUser && currentUser.id === updatedUser.id && typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        toast({
          title: "تم تحديث الصلاحيات",
          description: `تم تحديث صلاحيات المستخدم ${updatedUser.name} بنجاح.`,
        });

        setIsPermissionsDialogOpen(false);
        setSelectedUser(null);
        fetchUsers(); // Refetch users to update the list

        if(currentUser && currentUser.id === updatedUser.id) {
            window.location.reload();
        }
    } catch(error) {
        console.error("Error updating permissions:", error);
        toast({ title: "خطأ", description: "لم نتمكن من تحديث الصلاحيات.", variant: "destructive" });
    }
  }, [selectedUser, currentUser, toast, userForm, fetchUsers]);
  
  const handleSaveUser: SubmitHandler<UserFormValues> = async (data) => {
    try {
        if (selectedUser) {
            // Edit existing user
            const userDocRef = doc(db, 'users', selectedUser.id);
            // Email cannot be changed here as it's tied to Firebase Auth.
            const { email, ...updatableData } = data;
            await updateDoc(userDocRef, {
                ...updatableData,
                permissions: permissionsByRole[data.role], // Reset permissions based on new role
            });
            toast({
                title: "تم تحديث بيانات المستخدم",
                description: `تم تحديث بيانات ${data.name} بنجاح.`,
            });
        } else {
            // Add new user to Firestore
            // Check for duplicate email
            const q = query(collection(db, "users"), where("email", "==", data.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                toast({
                    title: "مستخدم موجود بالفعل",
                    description: "يوجد مستخدم مسجل بنفس البريد الإلكتروني.",
                    variant: "destructive",
                });
                return;
            }
            
            await addDoc(collection(db, 'users'), {
                ...data,
                avatar: 'https://placehold.co/100x100.png',
                permissions: permissionsByRole[data.role],
            });
            toast({
                title: "تمت إضافة المستخدم",
                description: `تمت إضافة ${data.name}. تذكر أن تنشئ له حساب مصادقة في Firebase Console بنفس البريد الإلكتروني.`,
            });
        }

        setIsUserDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();

    } catch (error) {
        console.error("Error updating user:", error);
        toast({ title: "خطأ", description: "لم نتمكن من حفظ بيانات المستخدم.", variant: "destructive" });
    }
  };

  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    if (userToDelete.id === currentUser?.id) {
        toast({
            title: "خطأ",
            description: "لا يمكنك حذف حسابك الخاص.",
            variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
        return;
    }

    try {
        const userDocRef = doc(db, 'users', userToDelete.id);
        await deleteDoc(userDocRef);
        
        toast({
          title: "تم حذف المستخدم",
          description: `تم حذف بيانات المستخدم ${userToDelete.name} من النظام. ملاحظة: يجب حذف المستخدم من لوحة تحكم Firebase Auth يدويًا.`,
          variant: "destructive"
        });
        
        fetchUsers(); // Refetch users to update the list
    } catch (error) {
        console.error("Error deleting user:", error);
        toast({ title: "خطأ", description: "لم نتمكن من حذف المستخدم.", variant: "destructive" });
    } finally {
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
    }
  }, [userToDelete, currentUser?.id, toast, fetchUsers]);
  
  const onChangePasswordSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول لتغيير كلمة المرور.", variant: "destructive" });
      return;
    }
    
    if (data.newPassword !== data.confirmPassword) {
        toast({ title: "خطأ", description: "كلمة المرور الجديدة وتأكيدها غير متطابقين.", variant: "destructive" });
        return;
    }

    const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
    
    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, data.newPassword);
      toast({
        title: "تم تغيير كلمة المرور بنجاح!",
        description: "لقد تم تحديث كلمة المرور الخاصة بك.",
      });
      passwordForm.reset();
    } catch (error: any) {
        console.error("Password change error:", error);
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          toast({ title: "خطأ", description: "كلمة المرور الحالية غير صحيحة.", variant: "destructive"});
        } else {
          toast({ title: "خطأ", description: "حدث خطأ غير متوقع أثناء تغيير كلمة المرور.", variant: "destructive"});
        }
    }
  };

  const canManageUsers = currentUser?.permissions.includes('manage_users');

  return (
    <>
    <div className="flex flex-col gap-8" dir="rtl">
       <div className="text-right">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          الإعدادات
        </h1>
        <p className="text-muted-foreground">
          إدارة إعدادات النظام والصلاحيات والمظهر.
        </p>
      </div>
      
      <Card>
        <CardHeader className="text-right">
          <CardTitle>تغيير كلمة المرور</CardTitle>
           <CardDescription>
            لأمان حسابك، استخدم كلمة مرور قوية لم تستخدمها في أي مكان آخر.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={passwordForm.handleSubmit(onChangePasswordSubmit)} className="max-w-md space-y-4 text-right">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword", { required: "هذا الحقل مطلوب" })} />
                 {passwordForm.formState.errors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input id="newPassword" type="password" {...passwordForm.register("newPassword", { required: "هذا الحقل مطلوب", minLength: { value: 6, message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" } })} />
                {passwordForm.formState.errors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword", { required: "هذا الحقل مطلوب" })} />
                {passwordForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <div className="flex justify-start">
                <Button type="submit">
                    <KeyRound className="ml-2 h-4 w-4" />
                    حفظ كلمة المرور الجديدة
                </Button>
              </div>
           </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-right">
          <CardTitle>المظهر</CardTitle>
           <CardDescription>
            قم بتخصيص مظهر التطبيق. اختر بين الوضع الفاتح أو الداكن.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <ThemeToggle />
        </CardContent>
      </Card>
      
      {canManageUsers && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="text-right">
                <CardTitle>إدارة المستخدمين</CardTitle>
                <CardDescription>
                إضافة وتعديل وحذف المستخدمين وتحديد صلاحياتهم.
                <br/>
                <strong className="text-amber-600">ملاحظة هامة:</strong> عند إضافة مستخدم جديد، يجب عليك إنشاء حساب له في <strong className="font-bold">Firebase Authentication</strong> يدويًا بنفس البريد الإلكتروني.
                </CardDescription>
            </div>
            
            <Button onClick={() => handleOpenUserDialog()}>
                <PlusCircle className="ml-2 h-4 w-4" />
                إضافة مستخدم
            </Button>
            
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
              <UsersTable 
                users={users} 
                onEdit={handleOpenUserDialog} 
                onEditPermissions={handleOpenPermissionsDialog}
                onDelete={handleOpenDeleteDialog}
                onResetPassword={handleResetPassword}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>

    {canManageUsers && (
      <>
        <UserDialog
          isOpen={isUserDialogOpen}
          onOpenChange={setIsUserDialogOpen}
          isEdit={!!selectedUser}
          form={userForm}
          onSubmit={handleSaveUser}
        />
        
        <PermissionsDialog
          isOpen={isPermissionsDialogOpen}
          onOpenChange={setIsPermissionsDialogOpen}
          form={userForm}
          onSubmit={handleSavePermissions}
          selectedUser={selectedUser}
        />

        <DeleteUserDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDelete={handleDeleteUser}
          userToDelete={userToDelete}
        />
      </>
    )}
    </>
  );
}
