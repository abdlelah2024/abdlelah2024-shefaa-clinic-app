
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, ListFilter, Loader2 } from 'lucide-react';
import AppointmentsTable from '@/components/appointments/appointments-table';
import type { Appointment, AppointmentStatus, Doctor, Patient } from '@/lib/types';
import AddAppointmentDialog from '@/components/appointments/add-appointment-dialog';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast"
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addAppointment } from '@/lib/services';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const fetchAppointmentsAndData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch appointments
      const appointmentsQuery = query(collection(db, 'appointments'), orderBy('appointmentDate', 'desc'));
      const appointmentSnapshot = await getDocs(appointmentsQuery);
      const appointmentsList = appointmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(appointmentsList);

      // Fetch doctors
      const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
      const doctorsList = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
      setDoctors(doctorsList);

      // Fetch patients
      const patientsSnapshot = await getDocs(collection(db, 'patients'));
      const patientsList = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(patientsList);

    } catch (error) {
      console.error("Error fetching data: ", error);
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
    fetchAppointmentsAndData();
  }, [fetchAppointmentsAndData]);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const startOfCurrentWeek = startOfWeek(today);
  const endOfCurrentWeek = endOfWeek(today);
  
  const startOfCurrentMonth = startOfMonth(today);
  const endOfCurrentMonth = endOfMonth(today);

  const dailyAppointments = appointments.filter(a => a.appointmentDate === todayStr && a.status !== 'ملغي');
  const weeklyAppointments = appointments.filter(a => {
    const appDate = parseISO(a.appointmentDate);
    return isWithinInterval(appDate, { start: startOfCurrentWeek, end: endOfCurrentWeek }) && a.status !== 'ملغي';
  });
  const monthlyAppointments = appointments.filter(a => {
     const appDate = parseISO(a.appointmentDate);
    return isWithinInterval(appDate, { start: startOfCurrentMonth, end: endOfCurrentMonth }) && a.status !== 'ملغي';
  });

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>, id?: string) => {
    try {
      if (id) {
        // Editing existing appointment in Firestore
        const appointmentDocRef = doc(db, 'appointments', id);
        await updateDoc(appointmentDocRef, appointmentData);
        toast({
          title: "تم تحديث الموعد",
          description: `تم تحديث تفاصيل موعد المريض ${appointmentData.patientName} بنجاح.`,
        });
      } else {
        // Adding new appointment to Firestore
        await addAppointment(appointmentData);
        toast({
          title: "تمت إضافة الموعد",
          description: `تم حجز موعد جديد للمريض ${appointmentData.patientName} بنجاح.`,
        });
      }
      fetchAppointmentsAndData(); // Refetch all data
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
       console.error("Error saving appointment: ", error);
       toast({
         title: "حدث خطأ",
         description: "لم نتمكن من حفظ الموعد. الرجاء المحاولة مرة أخرى.",
         variant: "destructive"
       });
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const appointmentDocRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentDocRef, { status: 'ملغي' });
      toast({
        title: "تم إلغاء الموعد",
        description: "تم تغيير حالة الموعد إلى 'ملغي'.",
        variant: "destructive"
      });
      fetchAppointmentsAndData(); // Refetch
    } catch (error) {
      console.error("Error cancelling appointment: ", error);
       toast({
         title: "حدث خطأ",
         description: "لم نتمكن من إلغاء الموعد.",
         variant: "destructive"
       });
    }
  };
  
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditDialogOpen(true);
  }

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
     try {
        const appointmentDocRef = doc(db, 'appointments', appointmentId);
        await updateDoc(appointmentDocRef, { status: newStatus });
        toast({
          title: "تم تحديث حالة الموعد",
          description: `تم تغيير حالة الموعد إلى '${newStatus}'.`,
        });
        fetchAppointmentsAndData(); // Refetch
     } catch (error) {
       console.error("Error updating status: ", error);
       toast({
         title: "حدث خطأ",
         description: "لم نتمكن من تحديث حالة الموعد.",
         variant: "destructive"
       });
     }
  }


  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            إدارة المواعيد
          </h1>
          <p className="text-muted-foreground">
            عرض وجدولة وإدارة جميع المواعيد.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
            <ListFilter className="ml-2 h-4 w-4" />
            تصفية
          </Button>
          <AddAppointmentDialog 
            doctors={doctors} 
            patients={patients} 
            onSave={(data) => handleSaveAppointment(data)}
            isOpen={isAddDialogOpen}
            setIsOpen={setIsAddDialogOpen}
          >
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="ml-2 h-4 w-4" />
              إضافة موعد
            </Button>
          </AddAppointmentDialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
          <Tabs defaultValue="weekly">
            <div className="border-b p-4">
              <TabsList>
                <TabsTrigger value="daily">يومي</TabsTrigger>
                <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
                <TabsTrigger value="monthly">شهري</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="daily" className="p-4">
              <AppointmentsTable appointments={dailyAppointments} onCancel={handleCancelAppointment} onEdit={handleEditAppointment} onStatusChange={handleStatusChange} />
            </TabsContent>
            <TabsContent value="weekly" className="p-4">
              <AppointmentsTable appointments={weeklyAppointments} onCancel={handleCancelAppointment} onEdit={handleEditAppointment} onStatusChange={handleStatusChange} />
            </TabsContent>
            <TabsContent value="monthly" className="p-4">
              <AppointmentsTable appointments={monthlyAppointments} onCancel={handleCancelAppointment} onEdit={handleEditAppointment} onStatusChange={handleStatusChange} />
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <AddAppointmentDialog 
        doctors={doctors} 
        patients={patients} 
        onSave={(data) => handleSaveAppointment(data, selectedAppointment?.id)}
        isOpen={isEditDialogOpen}
        setIsOpen={(isOpen) => {
          setIsEditDialogOpen(isOpen);
          if (!isOpen) setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      >
        <div/>
      </AddAppointmentDialog>
    </div>
  );
}
