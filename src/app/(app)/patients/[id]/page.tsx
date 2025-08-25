
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Patient, Appointment, Doctor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlusCircle, User, Calendar, Phone, Mail, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import AddAppointmentDialog from '@/components/appointments/add-appointment-dialog';
import { useToast } from "@/hooks/use-toast";
import PatientAppointmentsList from '@/components/patients/patient-appointments-list';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addAppointment } from '@/lib/services';


const PatientDetailCard = ({ patient, onBookAppointmentClick }: { patient: Patient, onBookAppointmentClick: () => void }) => (
    <Card className="lg:col-span-1 self-start text-right">
        <CardHeader className="items-center text-center">
             <Avatar className="h-28 w-28 mb-4 border-4 border-primary/20">
                <AvatarImage src={patient.avatar} alt={patient.name} />
                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline text-2xl">{patient.name}</CardTitle>
            <CardDescription>انضم بتاريخ: {format(new Date(patient.createdAt), 'yyyy-MM-dd')}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
            <Separator className="my-4" />
            <div className="space-y-4">
                <div className="flex items-center justify-end">
                    <span>الجنس: {patient.gender}</span>
                    <User className="mr-3 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-end">
                    <span>العمر: {patient.age} سنة</span>
                    <TrendingUp className="mr-3 h-4 w-4 text-muted-foreground" />
                </div>
                 <div className="flex items-center justify-end">
                    <span>الهاتف: {patient.phone}</span>
                    <Phone className="mr-3 h-4 w-4 text-muted-foreground" />
                </div>
            </div>
             <Separator className="my-4" />
             <Button className="w-full mt-2" onClick={onBookAppointmentClick}>
                <PlusCircle className="ml-2 h-4 w-4"/>
                حجز موعد جديد
             </Button>
        </CardContent>
    </Card>
);

const MedicalHistoryCard = ({ patient }: { patient: Patient }) => (
    <Card className="text-right">
        <CardHeader>
            <CardTitle>السجل الطبي</CardTitle>
            <CardDescription>تاريخ الزيارات والتشخيصات السابقة.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                {patient.medicalHistory.length > 0 ? patient.medicalHistory.map((record, index) => (
                    <div key={index} className="relative pr-6 text-right">
                        <div className="absolute right-0 top-0 h-full w-px bg-border"></div>
                        <div className="absolute right-[-9px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background"></div>
                        <p className="font-semibold">{record.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(record.date), 'yyyy-MM-dd')} - مع {record.doctor}
                        </p>
                        <p className="mt-2 text-sm">{record.notes}</p>
                    </div>
                )) : (
                    <div className="text-center text-muted-foreground py-8">
                        لا يوجد سجل طبي لهذا المريض بعد.
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
);


export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchPatientData = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
        // Fetch patient details
        const patientDocRef = doc(db, 'patients', patientId);
        const patientDoc = await getDoc(patientDocRef);
        if (patientDoc.exists()) {
            const patientData = { id: patientDoc.id, ...patientDoc.data() } as Patient;
            setPatient(patientData);
            setAllPatients([patientData]); // For the appointment dialog
        } else {
            toast({ title: "خطأ", description: "لم يتم العثور على المريض.", variant: "destructive" });
            router.push('/patients');
            return;
        }

        // Fetch patient appointments
        const appointmentsQuery = query(collection(db, 'appointments'), where('patientId', '==', patientId));
        const appointmentSnapshot = await getDocs(appointmentsQuery);
        const patientAppointments = appointmentSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Appointment))
            .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
        setAppointments(patientAppointments);
        
        // Fetch doctors
        const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
        setDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)));


    } catch (error) {
        console.error("Error fetching patient data: ", error);
        toast({ title: "خطأ", description: "لم نتمكن من جلب بيانات المريض.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [patientId, toast, router]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);


  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!patient) {
    return <div className="text-center">لم يتم العثور على المريض.</div>;
  }
  
  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      await addAppointment(appointmentData);
      setIsAddAppointmentDialogOpen(false);
      toast({
        title: "تمت إضافة الموعد",
        description: `تم حجز موعد جديد للمريض ${appointmentData.patientName} بنجاح.`,
      });
      fetchPatientData(); // Refetch appointments
      router.push('/appointments');
    } catch(error) {
       console.error("Error saving appointment from patient profile:", error);
       toast({ title: "خطأ", description: "لم نتمكن من حفظ الموعد."});
    }
  };


  return (
    <>
    <div className="flex flex-col gap-8" dir="rtl">
       <div className="text-right">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          ملف المريض
        </h1>
        <p className="text-muted-foreground">
          عرض شامل لبيانات المريض وسجله الطبي ومواعيده.
        </p>
      </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
           <PatientDetailCard patient={patient} onBookAppointmentClick={() => setIsAddAppointmentDialogOpen(true)} />
           <div className="lg:col-span-2 flex flex-col gap-6">
                <MedicalHistoryCard patient={patient} />
                <PatientAppointmentsList appointments={appointments} />
           </div>
        </div>
    </div>
    <AddAppointmentDialog 
        doctors={doctors} 
        patients={allPatients} 
        onSave={(data) => handleSaveAppointment(data)}
        isOpen={isAddAppointmentDialogOpen}
        setIsOpen={setIsAddAppointmentDialogOpen}
        defaultPatientId={patient.id}
      >
        {/* Dummy trigger as the dialog is controlled by state */}
        <div/>
      </AddAppointmentDialog>
    </>
  );
}
