
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Doctor, Appointment, User, Patient } from '@/lib/types';
import { PlusCircle, Pencil, Loader2 } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import AddAppointmentDialog from '@/components/appointments/add-appointment-dialog';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler } from 'react-hook-form';
import DoctorDialog from '@/components/doctors/doctor-dialog';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addAppointment } from '@/lib/services';


export type DoctorFormValues = {
  name: string;
  specialty: string;
  serviceCost: number;
  freeReturnDays: number;
  workHours: {
    [key: string]: { start: string; end: string; enabled: boolean };
  };
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDoctorDialogOpen, setIsDoctorDialogOpen] = useState(false);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  
  const { reset, ...form } = useForm<DoctorFormValues>({
    defaultValues: {
      workHours: {
        Sunday: { start: '09:00', end: '17:00', enabled: true },
        Monday: { start: '09:00', end: '17:00', enabled: true },
        Tuesday: { start: '09:00', end: '17:00', enabled: true },
        Wednesday: { start: '09:00', end: '17:00', enabled: true },
        Thursday: { start: '09:00', end: '13:00', enabled: true },
        Friday: { start: '09:00', end: '17:00', enabled: false },
        Saturday: { start: '10:00', end: '15:00', enabled: true },
      }
    }
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const doctorsCollection = collection(db, 'doctors');
      const doctorSnapshot = await getDocs(doctorsCollection);
      const doctorsList = doctorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
      setDoctors(doctorsList);

      const patientsCollection = collection(db, 'patients');
      const patientSnapshot = await getDocs(patientsCollection);
      const patientsList = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(patientsList);

    } catch (error) {
      console.error("Error fetching doctors: ", error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "لم نتمكن من جلب البيانات من قاعدة البيانات.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
        const userString = localStorage.getItem('user');
        setCurrentUser(userString ? JSON.parse(userString) : null);
    }
  }, [fetchData]);
  
  const handleOpenDialog = (doctor: Doctor | null = null) => {
    setSelectedDoctor(doctor);
    if (doctor) {
      const doctorWorkHours = Object.keys(form.getValues('workHours')).reduce((acc, day) => {
        const dayData = doctor.workHours[day];
        acc[day] = {
          start: dayData?.start || '09:00',
          end: dayData?.end || '17:00',
          enabled: !!dayData
        };
        return acc;
      }, {} as DoctorFormValues['workHours']);

      reset({
        name: doctor.name,
        specialty: doctor.specialty,
        serviceCost: doctor.serviceCost,
        freeReturnDays: doctor.freeReturnDays,
        workHours: doctorWorkHours
      });
    } else {
      reset({
        name: '',
        specialty: '',
        serviceCost: 0,
        freeReturnDays: 0,
        workHours: {
            Sunday: { start: '09:00', end: '17:00', enabled: true },
            Monday: { start: '09:00', end: '17:00', enabled: true },
            Tuesday: { start: '09:00', end: '17:00', enabled: true },
            Wednesday: { start: '09:00', end: '17:00', enabled: true },
            Thursday: { start: '09:00', end: '13:00', enabled: true },
            Friday: { start: '09:00', end: '17:00', enabled: false },
            Saturday: { start: '10:00', end: '15:00', enabled: false },
        }
      });
    }
    setIsDoctorDialogOpen(true);
  }

  const handleFormSubmit: SubmitHandler<DoctorFormValues> = async (data) => {
    const formattedWorkHours = Object.entries(data.workHours).reduce((acc, [day, value]) => {
        if (value.enabled) {
          acc[day] = { start: value.start, end: value.end };
        }
        return acc;
    }, {} as Doctor['workHours']);

    const doctorData = {
        name: data.name,
        specialty: data.specialty,
        serviceCost: Number(data.serviceCost),
        freeReturnDays: Number(data.freeReturnDays),
        workHours: formattedWorkHours,
    };

    try {
        if (selectedDoctor) {
          // Edit Doctor in Firestore
          const doctorDocRef = doc(db, 'doctors', selectedDoctor.id);
          await updateDoc(doctorDocRef, doctorData);
          toast({
            title: "تم تحديث بيانات الطبيب",
            description: `تم تحديث بيانات الطبيب ${data.name} بنجاح.`,
          });
        } else {
          // Add Doctor to Firestore
          // Check for duplicate name
          const q = query(collection(db, "doctors"), where("name", "==", data.name));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              toast({
                  title: "طبيب موجود بالفعل",
                  description: "يوجد طبيب مسجل بنفس الاسم.",
                  variant: "destructive",
              });
              return;
          }

          const doctorsCollection = collection(db, 'doctors');
          await addDoc(doctorsCollection, {
              ...doctorData,
              avatar: 'https://placehold.co/128x128.png',
              createdAt: new Date().toISOString(),
          });
          toast({
            title: "تمت إضافة الطبيب",
            description: `تم إضافة الطبيب ${data.name} بنجاح.`,
          });
        }
        setIsDoctorDialogOpen(false);
        setSelectedDoctor(null);
        fetchData(); // Refetch doctors list
    } catch (error) {
        console.error("Error saving doctor:", error);
        toast({
            title: "حدث خطأ",
            description: "لم نتمكن من حفظ بيانات الطبيب. الرجاء المحاولة مرة أخرى.",
            variant: "destructive",
        });
    }
  };
  
  const handleBookAppointmentClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsAddAppointmentDialogOpen(true);
  }

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      await addAppointment(appointmentData);
      setIsAddAppointmentDialogOpen(false);
      toast({
        title: "تمت إضافة الموعد",
        description: `تم حجز موعد جديد للمريض ${appointmentData.patientName} بنجاح.`,
      });
      router.push('/appointments');
    } catch (error) {
      console.error("Error saving appointment from doctors page:", error);
      toast({
        title: "خطأ",
        description: "لم نتمكن من حفظ الموعد.",
        variant: "destructive"
      });
    }
  };

  const canManageDoctors = currentUser?.permissions.includes('manage_doctors');
  const dayNames: { [key: string]: string } = {
    Sunday: 'الأحد',
    Monday: 'الاثنين',
    Tuesday: 'الثلاثاء',
    Wednesday: 'الأربعاء',
    Thursday: 'الخميس',
    Friday: 'الجمعة',
    Saturday: 'السبت',
  };

  return (
    <>
    <div className="flex flex-col gap-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            الأطباء والخدمات
          </h1>
          <p className="text-muted-foreground">
            إدارة الأطباء، ساعات العمل، والخدمات المقدمة.
          </p>
        </div>
        {canManageDoctors && (
             <Dialog open={isDoctorDialogOpen} onOpenChange={setIsDoctorDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()}>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        إضافة طبيب
                    </Button>
                </DialogTrigger>
                <DoctorDialog 
                    isOpen={isDoctorDialogOpen} 
                    onOpenChange={setIsDoctorDialogOpen}
                    isEdit={!!selectedDoctor}
                    onSubmit={handleFormSubmit}
                    form={form}
                    reset={reset}
                />
            </Dialog>
        )}
      </div>

        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="flex flex-col text-right">
                <CardHeader className="items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="font-headline text-xl">{doctor.name}</CardTitle>
                  <CardDescription>{doctor.specialty}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="flex justify-between items-center text-sm border-t pt-4">
                        <span className="text-muted-foreground">تكلفة الكشف</span>
                        <span className="font-semibold">{doctor.serviceCost} ريال</span>
                    </div>
                     <div className="flex justify-between items-center text-sm border-t pt-4 mt-4">
                        <span className="text-muted-foreground">عودة مجانية خلال</span>
                        <span className="font-semibold">{doctor.freeReturnDays} أيام</span>
                    </div>
                     <div className="border-t pt-4 mt-4">
                        <span className="text-sm text-muted-foreground">أيام العمل المتاحة</span>
                        <div className="flex flex-wrap gap-2 mt-2 justify-end">
                          {Object.keys(dayNames).map((day) => (
                            <Badge key={day} variant={doctor.workHours[day] ? 'default' : 'outline'} className={doctor.workHours[day] ? 'bg-green-100 text-green-800' : ''}>
                              {dayNames[day]}
                            </Badge>
                          ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button className="w-full" onClick={() => handleBookAppointmentClick(doctor)}>حجز موعد</Button>
                  {canManageDoctors && (
                     <Dialog open={isDoctorDialogOpen} onOpenChange={(open) => {
                        if (open) handleOpenDialog(doctor);
                        else setIsDoctorDialogOpen(false);
                     }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">تعديل</span>
                            </Button>
                        </DialogTrigger>
                         <DoctorDialog 
                            isOpen={isDoctorDialogOpen} 
                            onOpenChange={setIsDoctorDialogOpen}
                            isEdit={!!selectedDoctor}
                            onSubmit={handleFormSubmit}
                            form={form}
                            reset={reset}
                        />
                    </Dialog>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
    </div>

     <AddAppointmentDialog 
        doctors={doctors} 
        patients={patients} 
        onSave={(data) => handleSaveAppointment(data)}
        isOpen={isAddAppointmentDialogOpen}
        setIsOpen={setIsAddAppointmentDialogOpen}
        defaultDoctorId={selectedDoctor?.id}
      >
        <div/>
      </AddAppointmentDialog>
    </>
  );
}
