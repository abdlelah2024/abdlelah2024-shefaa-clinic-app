
'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Doctor, Patient, Appointment, AppointmentStatus } from '@/lib/types';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

type FormValues = {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
};

interface AddAppointmentDialogProps {
  doctors: Doctor[];
  patients: Patient[];
  onSave: (data: Omit<Appointment, 'id'>, id?: string) => void;
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  defaultDoctorId?: string;
  defaultPatientId?: string;
  appointment?: Appointment | null;
}

export default function AddAppointmentDialog({ 
  doctors, 
  patients, 
  onSave, 
  children, 
  isOpen, 
  setIsOpen, 
  defaultDoctorId, 
  defaultPatientId,
  appointment 
}: AddAppointmentDialogProps) {
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<FormValues>();

  const isEditMode = !!appointment;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && appointment) {
         reset({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          reason: appointment.reason,
        });
      } else {
         // Reset the form for adding new
        reset({
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          patientId: defaultPatientId || '',
          doctorId: defaultDoctorId || '',
          reason: ''
        });
      }
    }
  }, [isOpen, isEditMode, appointment, reset, defaultPatientId, defaultDoctorId]);


  const onSubmit = (data: FormValues) => {
    const doctor = doctors.find(d => d.id === data.doctorId);
    if (!doctor) return;
    
    const patient = patients.find(p => p.id === data.patientId);
    if (!patient) return;

    const appointmentData: Omit<Appointment, 'id'> = {
      ...data,
      doctorName: doctor.name,
      patientName: patient.name,
      patientAvatar: patient.avatar,
      status: appointment?.status || 'مجدول',
      cost: appointment?.cost
    }

    onSave(appointmentData, appointment?.id);
    
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>{isEditMode ? 'تعديل بيانات الموعد' : 'إضافة موعد جديد'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'قم بتحديث تفاصيل الموعد. انقر على "حفظ التغييرات" عند الانتهاء.' : 'اختر المريض والطبيب واملأ تفاصيل الموعد الجديد.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4 text-right">
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patientId" className="text-right">المريض</Label>
              <Controller
                name="patientId"
                control={control}
                rules={{ required: "الرجاء اختيار المريض" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر مريض..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {errors.patientId && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.patientId.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctorId" className="text-right">الطبيب</Label>
               <Controller
                name="doctorId"
                control={control}
                rules={{ required: "الرجاء اختيار الطبيب" }}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                        <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="اختر طبيب..." />
                        </SelectTrigger>
                        <SelectContent>
                        {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} - {d.specialty}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
              />
            </div>
            {errors.doctorId && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.doctorId.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentDate" className="text-right">التاريخ</Label>
              <Input id="appointmentDate" type="date" {...register("appointmentDate", { required: "التاريخ مطلوب" })} className="col-span-3"/>
            </div>
            {errors.appointmentDate && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.appointmentDate.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentTime" className="text-right">الوقت</Label>
              <Input id="appointmentTime" type="time" {...register("appointmentTime", { required: "الوقت مطلوب" })} className="col-span-3"/>
            </div>
             {errors.appointmentTime && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.appointmentTime.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">السبب</Label>
              <Textarea id="reason" {...register("reason", { required: "سبب الزيارة مطلوب" })} className="col-span-3" placeholder="مثال: فحص دوري، تنظيف أسنان..."/>
            </div>
            {errors.reason && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.reason.message}</p>}

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
            <Button type="submit">{isEditMode ? 'حفظ التغييرات' : 'حفظ الموعد'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
