
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Appointment, Patient, MedicalRecord, Doctor } from '@/lib/types';
import { Clock, UserCheck, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import AddMedicalRecordDialog from '@/components/patients/add-medical-record-dialog';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, arrayUnion, getDocs } from 'firebase/firestore';


const QueueColumn = ({ 
    title, 
    appointments, 
    icon: Icon,
    actions
}: { 
    title: string, 
    appointments: Appointment[], 
    icon: React.ElementType,
    actions?: (appointment: Appointment) => React.ReactNode 
}) => (
    <Card className="flex-1 bg-muted/50 flex flex-col">
        <CardHeader className="flex flex-row-reverse items-center justify-start gap-3 space-y-0 text-right">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="font-headline text-lg">{title} ({appointments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-y-auto p-4">
            {appointments.map(apt => (
                <Card key={apt.id} className="shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4 text-right">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={apt.patientAvatar} alt={apt.patientName} />
                            <AvatarFallback>{apt.patientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-bold">{apt.patientName}</p>
                            <p className="text-sm text-muted-foreground">مع {apt.doctorName}</p>
                        </div>
                        <div className="text-sm font-semibold">{apt.appointmentTime}</div>
                    </CardContent>
                    {actions && (
                        <CardFooter className="bg-slate-50 p-2 justify-start border-t">
                            {actions(apt)}
                        </CardFooter>
                    )}
                </Card>
            ))}
             {appointments.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    لا يوجد مرضى في هذه القائمة حالياً.
                </div>
            )}
        </CardContent>
    </Card>
)

export default function QueuePage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointmentForRecord, setSelectedAppointmentForRecord] = useState<Appointment | null>(null);
    const { toast } = useToast();

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
                setDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)));
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };

        fetchDoctors();

        const q = query(collection(db, 'appointments'), where("appointmentDate", "==", todayStr));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const todaysAppointments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
            setAppointments(todaysAppointments);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching queue appointments: ", error);
            toast({
                title: "خطأ",
                description: "لم نتمكن من جلب قائمة الانتظار.",
                variant: "destructive"
            });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [todayStr, toast]);

    const waitingAppointments = useMemo(() => appointments
        .filter(a => a.status === 'مجدول')
        .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime)), [appointments]);

    const inSessionAppointments = useMemo(() => appointments
        .filter(a => a.status === 'في الانتظار')
        .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime)), [appointments]);
        
    const handleStartSession = async (appointmentId: string) => {
        const appointmentDocRef = doc(db, 'appointments', appointmentId);
        try {
            await updateDoc(appointmentDocRef, { status: 'في الانتظار' });
             toast({
                title: "بدأ الكشف",
                description: "تم نقل المريض إلى قائمة قيد الكشف.",
            });
        } catch (error) {
            console.error("Error starting session: ", error);
            toast({ title: "خطأ", description: "لم نتمكن من بدء الجلسة.", variant: "destructive" });
        }
    };

    const handleEndSession = async (appointment: Appointment) => {
        const patientDoc = await getDoc(doc(db, 'patients', appointment.patientId));
        if(patientDoc.exists()) {
            setSelectedAppointmentForRecord(appointment);
            setIsModalOpen(true);
        } else {
             toast({ title: "خطأ", description: "لم يتم العثور على المريض.", variant: "destructive" });
        }
    };

    const handleSaveMedicalRecord = async (record: Omit<MedicalRecord, 'date' | 'doctor'>) => {
        if (!selectedAppointmentForRecord) return;

        const newRecord: MedicalRecord = {
            ...record,
            date: format(new Date(), 'yyyy-MM-dd'),
            doctor: selectedAppointmentForRecord.doctorName
        };

        const patientDocRef = doc(db, 'patients', selectedAppointmentForRecord.patientId);
        const appointmentDocRef = doc(db, 'appointments', selectedAppointmentForRecord.id);

        try {
            // Update patient's medical history
            await updateDoc(patientDocRef, {
                medicalHistory: arrayUnion(newRecord)
            });

            // Update appointment status to 'مكتمل'
            const doctor = doctors.find(d => d.id === selectedAppointmentForRecord.doctorId);
            await updateDoc(appointmentDocRef, {
                status: 'مكتمل',
                cost: doctor?.serviceCost || 0
            });
            
            toast({
                title: "تم حفظ السجل الطبي",
                description: `تم تحديث السجل الطبي للمريض ${selectedAppointmentForRecord.patientName} بنجاح.`,
            });
        } catch(error) {
            console.error("Error saving medical record:", error);
            toast({ title: "خطأ", description: "لم نتمكن من حفظ السجل الطبي.", variant: "destructive" });
        } finally {
            // Close modal and reset state
            setIsModalOpen(false);
            setSelectedAppointmentForRecord(null);
        }
    };


  return (
    <>
    <div className="flex flex-col gap-8 h-[calc(100vh-120px)]" dir="rtl">
      <div className="text-right">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          قائمة الانتظار الذكية
        </h1>
        <p className="text-muted-foreground">
          إدارة تدفق المرضى في العيادة بشكل مرئي وفوري.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
       ) : (
          <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
            <QueueColumn 
                title="في الانتظار" 
                appointments={waitingAppointments} 
                icon={Clock}
                actions={(apt) => (
                    <Button size="sm" onClick={() => handleStartSession(apt.id)}>
                        بدء الكشف
                        <UserCheck className="mr-2 h-4 w-4" />
                    </Button>
                )}
            />
            <QueueColumn 
                title="قيد الكشف" 
                appointments={inSessionAppointments} 
                icon={UserCheck}
                actions={(apt) => (
                    <Button size="sm" variant="default" onClick={() => handleEndSession(apt)}>
                        إنهاء وإضافة سجل
                        <CheckCircle className="mr-2 h-4 w-4" />
                    </Button>
                )}
            />
          </div>
       )}
    </div>
     {selectedAppointmentForRecord && (
        <AddMedicalRecordDialog 
            isOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                setSelectedAppointmentForRecord(null);
            }}
            onSave={handleSaveMedicalRecord}
            patientId={selectedAppointmentForRecord.patientId}
            doctorName={selectedAppointmentForRecord?.doctorName || ''}
        />
     )}
    </>
  );
}
