
'use client';

import { useForm, SubmitHandler, UseFormReturn, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PatientFormValues } from '@/app/(app)/patients/page';

interface PatientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: UseFormReturn<PatientFormValues>;
  onSubmit: SubmitHandler<PatientFormValues>;
  reset: (values?: PatientFormValues) => void;
}

export default function PatientDialog({ isOpen, onOpenChange, isEdit, form, onSubmit, reset }: PatientDialogProps) {
    const { register, handleSubmit, control, formState: { errors } } = form;

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader className="text-right">
            <DialogTitle>{isEdit ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}</DialogTitle>
            <DialogDescription>
                {isEdit ? 'قم بتحديث التفاصيل هنا. انقر على "حفظ التغييرات" عند الانتهاء.' : 'أدخل بيانات المريض الجديد لإضافته إلى النظام. انقر على "حفظ المريض" عند الانتهاء.'}
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4 text-right">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                    الاسم
                </Label>
                <Input id="name" {...register("name", { required: "هذا الحقل مطلوب" })} className="col-span-3" />
                </div>
                {errors.name && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.name.message}</p>}
                
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                    رقم الهاتف
                </Label>
                <Input id="phone" {...register("phone", { required: "هذا الحقل مطلوب" })} className="col-span-3" />
                </div>
                {errors.phone && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.phone.message}</p>}

                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="age" className="text-right">
                    العمر
                </Label>
                <Input id="age" type="number" {...register("age", { required: "العمر مطلوب", valueAsNumber: true, min: { value: 0, message: "العمر يجب أن يكون إيجابياً" } })} className="col-span-3" />
                </div>
                {errors.age && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.age.message}</p>}

                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-right">
                    الجنس
                </Label>
                <Controller
                    name="gender"
                    control={control}
                    rules={{ required: "الرجاء اختيار الجنس" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                            <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="اختر الجنس..." />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="ذكر">ذكر</SelectItem>
                            <SelectItem value="أنثى">أنثى</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                </div>
                {errors.gender && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.gender.message}</p>}
            </div>
            <DialogFooter className="flex-row-reverse">
                 <Button type="button" variant="outline" onClick={handleClose}>إلغاء</Button>
                <Button type="submit">{isEdit ? 'حفظ التغييرات' : 'حفظ المريض'}</Button>
            </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
}
