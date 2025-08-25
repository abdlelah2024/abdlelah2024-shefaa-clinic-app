
'use client';

import { useForm, SubmitHandler, UseFormReturn, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DoctorFormValues } from '@/app/(app)/doctors/page';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';

interface DoctorDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isEdit: boolean;
    onSubmit: SubmitHandler<DoctorFormValues>;
    form: UseFormReturn<DoctorFormValues>;
    reset: (values?: DoctorFormValues) => void;
}

const dayNames: { [key: string]: string } = {
    Sunday: 'الأحد',
    Monday: 'الاثنين',
    Tuesday: 'الثلاثاء',
    Wednesday: 'الأربعاء',
    Thursday: 'الخميس',
    Friday: 'الجمعة',
    Saturday: 'السبت',
  };
  

export default function DoctorDialog({ isOpen, onOpenChange, isEdit, onSubmit, form, reset }: DoctorDialogProps) {
    const { register, handleSubmit, formState: { errors }, control, watch } = form;
    const workHours = watch("workHours");


    const handleClose = () => {
        onOpenChange(false);
    };

    return (
            <DialogContent className="sm:max-w-lg" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle>{isEdit ? "تعديل بيانات الطبيب" : "إضافة طبيب جديد"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "قم بتحديث تفاصيل الطبيب وساعات العمل هنا." : "أدخل تفاصيل الطبيب وساعات العمل لإضافته إلى النظام."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4 text-right max-h-[70vh] overflow-y-auto px-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">الاسم</Label>
                            <Input id="name" {...register("name", { required: "هذا الحقل مطلوب" })} />
                             {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="specialty">التخصص</Label>
                            <Input id="specialty" {...register("specialty", { required: "هذا الحقل مطلوب" })}/>
                             {errors.specialty && <p className="text-red-500 text-xs mt-1">{errors.specialty.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="serviceCost">تكلفة الكشف</Label>
                                <Input id="serviceCost" type="number" {...register("serviceCost", { required: "هذا الحقل مطلوب", valueAsNumber: true })} />
                                {errors.serviceCost && <p className="text-red-500 text-xs mt-1">{errors.serviceCost.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="freeReturnDays">عودة مجانية (أيام)</Label>
                                <Input id="freeReturnDays" type="number" {...register("freeReturnDays", { required: "هذا الحقل مطلوب", valueAsNumber: true })} placeholder="خلال (يوم)"/>
                                {errors.freeReturnDays && <p className="text-red-500 text-xs mt-1">{errors.freeReturnDays.message}</p>}
                            </div>
                        </div>

                        <Separator className="my-4"/>

                        <div className="space-y-4">
                             <Label className="text-base font-medium">ساعات العمل الأسبوعية</Label>
                             {Object.keys(dayNames).map((day) => (
                                <div key={day} className="grid grid-cols-12 items-center gap-2">
                                    <Controller
                                        name={`workHours.${day}.enabled`}
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id={`enabled-${day}`}
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="col-span-1"
                                            />
                                        )}
                                    />
                                    <Label htmlFor={`enabled-${day}`} className="col-span-3 cursor-pointer">
                                        {dayNames[day]}
                                    </Label>
                                    
                                    <div className="col-span-4">
                                         <Input 
                                            type="time" 
                                            {...register(`workHours.${day}.start`)} 
                                            disabled={!workHours?.[day]?.enabled}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input 
                                            type="time" 
                                            {...register(`workHours.${day}.end`)} 
                                            disabled={!workHours?.[day]?.enabled}
                                        />
                                    </div>
                                </div>
                             ))}
                        </div>

                    </div>
                    <DialogFooter className="flex-row-reverse border-t pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>إلغاء</Button>
                        <Button type="submit">{isEdit ? "حفظ التغييرات" : "حفظ الطبيب"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
    );
}
    
