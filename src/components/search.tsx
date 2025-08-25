
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, UserPlus, CalendarPlus, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { Patient, Appointment, Doctor } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import AddAppointmentDialog from './appointments/add-appointment-dialog';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { getPatients, getDoctors, addPatient, addAppointment } from '@/lib/services';
import { format } from 'date-fns';


type FormValues = {
  name: string;
  phone: string;
  age: number;
  gender: 'ذكر' | 'أنثى';
};


export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>();

  const fetchData = useCallback(async () => {
    try {
      const [patientsData, doctorsData] = await Promise.all([getPatients(), getDoctors()]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Error fetching data for search:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل بيانات البحث."});
    }
  }, [toast]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    if (query.length > 1) {
      const filteredPatients = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query.toLowerCase()) ||
          patient.phone.includes(query)
      );
      setResults(filteredPatients);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, patients]);
  
  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
  }

  const handleBookAppointmentClick = (e: React.MouseEvent, patient: Patient) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPatientForAppointment(patient);
    setIsAddAppointmentOpen(true);
    setIsOpen(false);
    setQuery('');
  }

 const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'patientAvatar' | 'status'>) => {
    const patient = patients.find(p => p.id === appointmentData.patientId);
    if (!patient) return;
    
    try {
        const newAppointmentData = {
          ...appointmentData,
          patientAvatar: patient.avatar,
          status: 'مجدول' as const,
          reason: appointmentData.reason || 'حجز سريع',
        };

        await addAppointment(newAppointmentData);

        setIsAddAppointmentOpen(false);
        toast({
          title: "تمت إضافة الموعد",
          description: `تم حجز موعد جديد للمريض ${newAppointmentData.patientName} بنجاح.`,
        });
        router.push('/appointments');
    } catch(error) {
       console.error("Error saving appointment from search:", error);
       toast({ title: "خطأ", description: "لم نتمكن من حفظ الموعد."});
    }
  };

  const handleOpenAddPatientDialog = () => {
    // Pre-fill form based on query
    const isPhoneNumber = /^[0-9\s+()-]*$/.test(query);
    reset({
      name: isPhoneNumber ? '' : query,
      phone: isPhoneNumber ? query : '',
      age: 0,
      gender: 'ذكر'
    });
    setIsAddPatientDialogOpen(true);
  }

  const handleAddPatientSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
        const newPatientData = {
          name: data.name,
          phone: data.phone,
          age: Number(data.age),
          gender: data.gender,
          avatar: 'https://placehold.co/100x100.png',
          createdAt: new Date().toISOString(),
          medicalHistory: [],
        };

        const newPatientId = await addPatient(newPatientData);

        setIsAddPatientDialogOpen(false);
        setIsOpen(false);
        setQuery('');
        reset();
        toast({
            title: "تمت إضافة المريض",
            description: `تمت إضافة ${newPatientData.name} إلى سجلات المرضى.`,
        });
        router.push(`/patients/${newPatientId}`);
    } catch (error) {
        console.error("Error adding patient from search:", error);
        toast({ title: "خطأ", description: "لم نتمكن من إضافة المريض."});
    }
  };


  return (
    <>
    <div className="relative w-full max-w-md" ref={triggerRef}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              dir="rtl"
              placeholder="بحث عن مريض بالاسم أو رقم الهاتف..."
              className="w-full rounded-full bg-muted pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length > 1 && setIsOpen(true)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          dir="rtl"
        >
          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              <p className="p-3 text-sm font-medium text-muted-foreground border-b text-right">المرضى المطابقون</p>
              <ul>
                {results.map((patient) => (
                  <li key={patient.id} className="border-b last:border-b-0">
                    <div className="flex items-center gap-3 px-3 py-2.5 text-right">
                       <div className="flex items-center gap-1">
                         <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                           <Link href={`/patients/${patient.id}`} onClick={handleResultClick}>
                             عرض <FileText className="mr-1 h-4 w-4" />
                           </Link>
                         </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={(e) => handleBookAppointmentClick(e, patient)}>
                            حجز <CalendarPlus className="mr-1 h-4 w-4" />
                         </Button>
                      </div>
                      <div className="flex-1">
                         <Link href={`/patients/${patient.id}`} onClick={handleResultClick} className="hover:underline">
                            <p className="font-semibold">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">{patient.phone}</p>
                         </Link>
                      </div>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={patient.avatar} alt={patient.name} />
                        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
             <div className="p-4 text-center">
              <p className="mb-3 text-sm text-muted-foreground">لم يتم العثور على مريض مطابق للبحث.</p>
                <Dialog open={isAddPatientDialogOpen} onOpenChange={setIsAddPatientDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={handleOpenAddPatientDialog}>
                        <UserPlus className="ml-2 h-4 w-4" />
                        إضافة مريض جديد
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle>إضافة مريض جديد</DialogTitle>
                        <DialogDescription>
                         املأ البيانات لإضافة مريض جديد إلى النظام.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleAddPatientSubmit)}>
                        <div className="grid gap-4 py-4 text-right">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name-search" className="text-right">
                            الاسم
                            </Label>
                            <Input id="name-search" {...register("name", { required: "هذا الحقل مطلوب" })} className="col-span-3" />
                        </div>
                        {errors.name && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.name.message}</p>}
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone-search" className="text-right">
                            رقم الهاتف
                            </Label>
                            <Input id="phone-search" {...register("phone", { required: "هذا الحقل مطلوب" })} className="col-span-3" />
                        </div>
                        {errors.phone && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.phone.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="age-search" className="text-right">
                            العمر
                            </Label>
                            <Input id="age-search" type="number" {...register("age", { required: "العمر مطلوب", valueAsNumber: true, min: { value: 0, message: "العمر يجب أن يكون إيجابياً" } })} className="col-span-3" />
                        </div>
                        {errors.age && <p className="col-span-4 text-red-500 text-xs text-left -mt-2 ml-24">{errors.age.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gender-search" className="text-right">
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
                          <Button type="button" variant="ghost" onClick={() => setIsAddPatientDialogOpen(false)}>إلغاء</Button>
                          <Button type="submit">حفظ المريض</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
    <AddAppointmentDialog
        doctors={doctors}
        patients={patients}
        onSave={handleSaveAppointment}
        isOpen={isAddAppointmentOpen}
        setIsOpen={setIsAddAppointmentOpen}
        defaultPatientId={selectedPatientForAppointment?.id}
      >
          {/* This is a dummy trigger, the dialog is controlled by state */}
          <div/>
      </AddAppointmentDialog>
    </>
  );
}
