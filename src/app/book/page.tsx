
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Doctor, Appointment, Patient } from '@/lib/types';
import { Stethoscope, ArrowRight, ArrowLeft, Calendar, Clock, User, Phone, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, set, getDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getDoctors, getAppointments, getPatientByPhone, addPatient, addAppointment } from '@/lib/services';

// Helper function to generate time slots
const generateTimeSlots = (startStr: string, endStr: string, appointmentDate: Date, existingAppointments: Appointment[]) => {
    const slots = [];
    let current = set(appointmentDate, { hours: parseInt(startStr.split(':')[0]), minutes: parseInt(startStr.split(':')[1]), seconds: 0, milliseconds: 0 });
    const end = set(appointmentDate, { hours: parseInt(endStr.split(':')[0]), minutes: parseInt(endStr.split(':')[1]), seconds: 0, milliseconds: 0 });
    const today = new Date();

    const existingTimes = existingAppointments
      .filter(apt => format(parseISO(apt.appointmentDate), 'yyyy-MM-dd') === format(appointmentDate, 'yyyy-MM-dd'))
      .map(apt => apt.appointmentTime);


    while (current < end) {
        const timeStr = format(current, 'HH:mm');
        const isPast = appointmentDate.toDateString() === today.toDateString() && current.getTime() < today.getTime();
        const isBooked = existingTimes.includes(timeStr);

        if (!isPast) {
             slots.push({ time: timeStr, available: !isBooked });
        }

        current.setMinutes(current.getMinutes() + 30); // 30 minute slots
    }
    return slots;
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [doctorsData, appointmentsData] = await Promise.all([
                getDoctors(),
                getAppointments()
            ]);
            setDoctors(doctorsData);
            setAppointments(appointmentsData);
        } catch (error) {
            console.error("Failed to fetch initial booking data:", error);
            toast({
                title: "خطأ",
                description: "لم نتمكن من تحميل بيانات الحجز. الرجاء المحاولة لاحقاً.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [toast]);


  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    goToNextStep();
  };
  
  const goToNextStep = () => setStep(prev => prev + 1);
  const goToPrevStep = () => {
      if (step === 2) {
          setSelectedDoctor(null);
          setSelectedDate(new Date());
          setSelectedTime(null);
      }
      setStep(prev => prev - 1)
  };

  const dayOfWeek = selectedDate ? getDay(selectedDate) : -1;
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
  const workHours = selectedDoctor?.workHours[dayName];
  
  const timeSlots = useMemo(() => {
    if (!workHours || !selectedDate || !selectedDoctor) return [];
    return generateTimeSlots(workHours.start, workHours.end, selectedDate, appointments.filter(a => a.doctorId === selectedDoctor.id));
  }, [workHours, selectedDate, selectedDoctor, appointments]);

  const handleBookingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime || !patientName || !patientPhone) {
        toast({
            title: "خطأ في البيانات",
            description: "الرجاء التأكد من ملء جميع الحقول المطلوبة.",
            variant: "destructive"
        });
        return;
    }
    
    setIsSubmitting(true);

    try {
        // Check if patient exists, if not create one
        let patient = await getPatientByPhone(patientPhone);
        if (!patient) {
            const newPatientData: Omit<Patient, 'id'> = {
                name: patientName,
                phone: patientPhone,
                age: 0, // Age can be updated later
                gender: 'ذكر', // Default, can be updated later
                avatar: 'https://placehold.co/100x100.png',
                createdAt: new Date().toISOString(),
                medicalHistory: []
            };
            const newPatientId = await addPatient(newPatientData);
            patient = { ...newPatientData, id: newPatientId };
        }
        
        // Create new appointment
        const newAppointmentData: Omit<Appointment, 'id'> = {
            patientId: patient.id,
            patientName: patient.name,
            patientAvatar: patient.avatar,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
            appointmentTime: selectedTime,
            reason: 'حجز عبر الإنترنت',
            status: 'مجدول'
        };

        await addAppointment(newAppointmentData);

        toast({
          title: "تم تأكيد الحجز بنجاح!",
          description: `موعدك مع ${selectedDoctor?.name} في ${selectedDate && format(selectedDate, 'PPP')} الساعة ${selectedTime} قد تم تأكيده.`,
        });
        router.push('/login');

    } catch(error) {
        console.error("Error submitting booking:", error);
        toast({
            title: "حدث خطأ",
            description: "لم نتمكن من تأكيد حجزك. الرجاء المحاولة مرة أخرى.",
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4" dir="rtl">
       <Card className="w-full max-w-4xl">
          <CardHeader className="text-center border-b pb-4">
            <Stethoscope className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="font-headline text-3xl mt-2">حجز موعد جديد</CardTitle>
            <CardDescription>
                أهلاً بك في مركز د. أحمد قايد سالم. اتبع الخطوات لحجز موعدك بسهولة.
            </CardDescription>
             <Link href="/login" className="text-sm text-primary hover:underline mt-2">
                هل أنت من موظفي العيادة؟
            </Link>
          </CardHeader>
          <CardContent className="p-6 min-h-[500px]">
            {isLoading ? (
                <div className="flex h-full min-h-[400px] justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
             <>
                {/* Step 1: Select Doctor */}
                {step === 1 && (
                    <div className="text-right">
                        <h3 className="font-bold text-lg mb-4 text-center">الخطوة 1: اختر الطبيب</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {doctors.map(doc => (
                                <Card 
                                    key={doc.id}
                                    className="p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                                    onClick={() => handleDoctorSelect(doc)}
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={doc.avatar} alt={doc.name} />
                                            <AvatarFallback>{doc.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-base">{doc.name}</p>
                                            <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                                        </div>
                                        <ArrowRight className="mr-auto h-5 w-5 text-muted-foreground" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Step 2: Select Date & Time */}
                {step === 2 && selectedDoctor && (
                    <div className="text-right">
                        <h3 className="font-bold text-lg mb-4 text-center">الخطوة 2: اختر التاريخ والوقت لـ <span className="text-primary">{selectedDoctor?.name}</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex justify-center">
                                <CalendarComponent
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        setSelectedDate(date);
                                        setSelectedTime(null); // Reset time when date changes
                                    }}
                                    disabled={(date) => {
                                        const day = getDay(date);
                                        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
                                        return date < new Date(new Date().setDate(new Date().getDate() - 1)) || !selectedDoctor?.workHours[dayName];
                                    }}
                                    initialFocus
                                />
                            </div>
                            <div className="max-h-64 overflow-y-auto pl-2">
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.length > 0 && timeSlots.some(s => s.available) ? timeSlots.map(({time, available}) => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? 'default' : 'outline'}
                                            disabled={!available}
                                            onClick={() => setSelectedTime(time)}
                                            className={cn(!available && "line-through text-muted-foreground")}
                                        >
                                            {time}
                                        </Button>
                                    )) : (
                                        <div className="col-span-3 text-center text-muted-foreground p-4">
                                            <p>{workHours ? "لا توجد مواعيد متاحة في هذا اليوم." : "الطبيب في إجازة بهذا اليوم. الرجاء اختيار يوم آخر."}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between">
                            <Button variant="outline" onClick={goToPrevStep}>
                                <ArrowLeft className="ml-2 h-4 w-4" /> العودة لاختيار الطبيب
                            </Button>
                            <Button onClick={goToNextStep} disabled={!selectedDate || !selectedTime}>
                                الخطوة التالية <ArrowRight className="mr-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Patient Details */}
                {step === 3 && (
                    <div className="text-right">
                        <h3 className="font-bold text-lg mb-4 text-center">الخطوة 3: أدخل بياناتك لتأكيد الحجز</h3>
                        <div className="text-center mb-6 p-3 bg-accent/20 rounded-md">
                            <p className="font-semibold">ملخص الحجز:</p>
                            <p className="text-sm text-accent-foreground">
                                <Calendar className="inline-block ml-1 h-4 w-4" />
                                {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy')}
                                <Clock className="inline-block ml-1 mr-2 h-4 w-4" />
                                {selectedTime}
                            </p>
                            <p className="text-sm text-accent-foreground">
                                <Stethoscope className="inline-block ml-1 h-4 w-4" />
                                مع {selectedDoctor?.name}
                            </p>
                        </div>
                        <form className="grid gap-4 max-w-md mx-auto" onSubmit={handleBookingSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="name"><User className="inline-block ml-2 h-4 w-4" />الاسم الكامل</Label>
                                <Input 
                                    id="name" 
                                    placeholder="مثال: محمد علي" 
                                    required 
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone"><Phone className="inline-block ml-2 h-4 w-4" />رقم الهاتف للتواصل</Label>
                                <Input 
                                    id="phone" 
                                    placeholder="05XXXXXXXX" 
                                    required 
                                    value={patientPhone}
                                    onChange={(e) => setPatientPhone(e.target.value)}
                                />
                            </div>
                            <div className="mt-6 flex justify-between">
                                <Button variant="outline" type="button" onClick={goToPrevStep}>
                                    <ArrowLeft className="ml-2 h-4 w-4" /> العودة
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                    تأكيد الحجز
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
             </>
            )}
          </CardContent>
       </Card>
    </div>
  );
}
    
