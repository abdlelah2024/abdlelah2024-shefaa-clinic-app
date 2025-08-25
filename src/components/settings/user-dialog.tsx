
'use client';

import { useForm, SubmitHandler, UseFormReturn, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserFormValues } from '@/app/(app)/settings/page';


interface UserDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isEdit: boolean;
    form: UseFormReturn<UserFormValues>;
    onSubmit: SubmitHandler<UserFormValues>;
}

export default function UserDialog({ isOpen, onOpenChange, isEdit, form, onSubmit }: UserDialogProps) {
    const { register, handleSubmit, control, formState: { errors } } = form;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle>{isEdit ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'قم بتعديل بيانات المستخدم هنا.' : 'أدخل بيانات المستخدم الجديد لإضافته إلى قاعدة البيانات.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                <div className="py-4 grid gap-4 text-right">
                    
                    <div className="space-y-2">
                        <Label htmlFor="name">الاسم</Label>
                        <Input id="name" {...register("name", { required: "الاسم مطلوب" })} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input id="email" type="email" {...register("email", { required: "البريد الإلكتروني مطلوب" })} disabled={isEdit} />
                         {isEdit && <p className="text-xs text-muted-foreground mt-1">لا يمكن تغيير البريد الإلكتروني بعد الإنشاء.</p>}
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">رقم الجوال</Label>
                        <Input id="phone" {...register("phone", { required: "رقم الجوال مطلوب" })} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">الدور</Label>
                        <Controller
                            name="role"
                            control={control}
                            rules={{ required: "الدور مطلوب" }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                                    <SelectTrigger>
                                    <SelectValue placeholder="اختر دور..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="مدير النظام">مدير النظام</SelectItem>
                                        <SelectItem value="موظف استقبال">موظف استقبال</SelectItem>
                                        <SelectItem value="طبيب">طبيب</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                    </div>

                    <p className="text-xs text-muted-foreground">
                       {isEdit 
                         ? "عند تغيير الدور، سيتم إعادة تعيين الصلاحيات إلى الوضع الافتراضي لهذا الدور."
                         : "سيتم تعيين الصلاحيات الافتراضية بناءً على الدور المحدد. يمكن تخصيصها لاحقًا."
                       }
                    </p>
                </div>
                <DialogFooter className="flex-row-reverse">
                    <Button type="submit">{isEdit ? 'حفظ التغييرات' : 'إضافة المستخدم'}</Button>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>إلغاء</Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
