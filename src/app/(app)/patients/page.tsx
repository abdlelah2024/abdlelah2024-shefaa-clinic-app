
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, ListFilter, Search, Loader2 } from 'lucide-react';
import PatientsTable from '@/components/patients/patients-table';
import type { Patient, Appointment, Doctor } from '@/lib/types';
import { useForm, SubmitHandler } from 'react-hook-form';
import AddAppointmentDialog from '@/components/appointments/add-appointment-dialog';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import PatientDialog from '@/components/patients/patient-dialog';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addAppointment } from '@/lib/services';

export type PatientFormValues = {
  name: string;
  phone: string;
  age: number;
  gender: 'ذكر' | 'أنثى';
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const { reset, ...form } = useForm<PatientFormValues>();
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const patientsCollection = collection(db, 'patients');
      const patientSnapshot = await getDocs(patientsCollection);
      const patientsList = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(patientsList);

      const doctorsCollection = collection(db, 'doctors');
      const doctorSnapshot = await getDocs(doctorsCollection);
      const doctorsList = doctorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
      setDoctors(doctorsList);

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
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (patient: Patient | null = null) => {
    setSelectedPatient(patient);
    if (patient) {
      reset({
        name: patient.name,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
      });
    } else {
      reset({
        name: '',
        phone: '',
        age: 0,
        gender: 'ذكر',
      });
    }
    setIsPatientDialogOpen(true);
  };
  
  const handleFormSubmit: SubmitHandler<PatientFormValues> = async (data) => {
    try {
      if (selectedPatient) {
          // Edit Patient in Firestore
          const patientDocRef = doc(db, 'patients', selectedPatient.id);
          const updatedData = { ...data, age: Number(data.age) };
          await updateDoc(patientDocRef, updatedData);
          
          toast({
              title: "تم تحديث البيانات",
              description: `تم تحديث بيانات المريض ${data.name} بنجاح.`,
          });
      } else {
          // Add Patient to Firestore
          // Check for duplicate phone number
          const q = query(collection(db, "patients"), where("phone", "==", data.phone));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              toast({
                  title: "مريض موجود بالفعل",
                  description: "يوجد مريض مسجل بنفس رقم الهاتف.",
                  variant: "destructive",
              });
              return;
          }

          const patientsCollection = collection(db, 'patients');
          await addDoc(patientsCollection, {
            ...data,
            age: Number(data.age),
            avatar: 'https://placehold.co/100x100.png',
            createdAt: new Date().toISOString(), // Or use serverTimestamp() for more accuracy
            medicalHistory: [],
          });
          toast({
              title: "تمت إضافة المريض",
              description: `تمت إضافة المريض ${data.name} بنجاح.`,
          });
      }
      setIsPatientDialogOpen(false);
      setSelectedPatient(null);
      fetchData(); // Refetch patients list
    } catch (error) {
        console.error("Error saving patient:", error);
        toast({
            title: "حدث خطأ",
            description: "لم نتمكن من حفظ بيانات المريض. الرجاء المحاولة مرة أخرى.",
            variant: "destructive",
        });
    }
  };
  
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  const handleBookAppointmentClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsAddAppointmentDialogOpen(true);
  };

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      await addAppointment(appointmentData);
      setIsAddAppointmentDialogOpen(false);
      toast({
        title: "تمت إضافة الموعد",
        description: `تم حجز موعد جديد للمريض ${appointmentData.patientName} بنجاح.`,
      });
      router.push('/appointments');
    } catch(error) {
       console.error("Error saving appointment from patients page:", error);
       toast({ title: "خطأ", description: "لم نتمكن من حفظ الموعد."});
    }
  };

  return (
    <>
    <div className="flex flex-col gap-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            إدارة المرضى
          </h1>
          <p className="text-muted-foreground">
            عرض وتعديل وإضافة سجلات المرضى.
          </p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة مريض
            </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="relative flex-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="بحث عن مريض..." 
                        className="pl-10 text-right"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Button variant="outline">
                    <ListFilter className="ml-2 h-4 w-4" />
                    تصفية
                </Button>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <PatientsTable patients={filteredPatients} onBookAppointment={handleBookAppointmentClick} onEdit={handleOpenDialog} />
            )}
        </CardContent>
      </Card>
    </div>
    
    <PatientDialog
        isOpen={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        isEdit={!!selectedPatient}
        form={form}
        onSubmit={handleFormSubmit}
        reset={reset}
    />
    
    <AddAppointmentDialog
      doctors={doctors}
      patients={patients}
      onSave={(data) => handleSaveAppointment(data)}
      isOpen={isAddAppointmentDialogOpen}
      setIsOpen={setIsAddAppointmentDialogOpen}
      defaultPatientId={selectedPatient?.id}
    >
      <div />
    </AddAppointmentDialog>
    </>
  );
}
