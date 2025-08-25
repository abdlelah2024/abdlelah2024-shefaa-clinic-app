
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Patient, MedicalRecord } from '@/lib/types';
import { diagnose } from '@/ai/flows/diagnose-flow';
import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';


type FormValues = {
  diagnosis: string;
  notes: string;
  treatmentPlan: string;
  followUp: string;
};

interface AddMedicalRecordDialogProps {
  patientId: string | null;
  doctorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<MedicalRecord, 'date' | 'doctor'>) => void;
}

export default function AddMedicalRecordDialog({ patientId, doctorName, isOpen, onClose, onSave }: AddMedicalRecordDialogProps) {
  const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<FormValues>();
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
        if(patientId) {
            const patientDoc = await getDoc(doc(db, 'patients', patientId));
            if(patientDoc.exists()) {
                setPatient({ id: patientDoc.id, ...patientDoc.data() } as Patient);
            }
        }
    }
    if(isOpen) {
       fetchPatient();
    } else {
       setPatient(null);
       reset();
    }
  }, [patientId, isOpen, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // We are combining notes, treatment and followup into the notes field for simplicity
    const combinedNotes = `ملاحظات: ${data.notes}\nخطة العلاج: ${data.treatmentPlan}\nالمتابعة: ${data.followUp}`;
    onSave({
      diagnosis: data.diagnosis,
      notes: combinedNotes
    });
    reset();
  };

  const handleSmartDiagnose = async () => {
    const notes = getValues("notes");
    if (!notes || !patient) return;

    setIsDiagnosing(true);
    try {
      const result = await diagnose({ 
        notes: notes,
        previousRecords: patient.medicalHistory 
      });
      if (result) {
        setValue("diagnosis", result.diagnosis);
        setValue("treatmentPlan", result.treatmentPlan);
        setValue("followUp", result.followUp);
      }
    } catch (error) {
      console.error("Error with smart diagnosis:", error);
      // Optionally, show a toast notification to the user
    } finally {
      setIsDiagnosing(false);
    }
  };
  
  const handleClose = () => {
      reset();
      onClose();
  }

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { handleClose(); } }}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>إضافة سجل طبي للمريض: {patient.name}</DialogTitle>
          <DialogDescription>
            أدخل ملاحظات الزيارة ثم استخدم "تشخيص ذكي" لتعبئة الحقول الأخرى تلقائياً.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4 text-right">
             <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات وتوصيات الزيارة</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="ملاحظات إضافية، وصفة طبية، توصيات للمريض..."
                rows={4}
              />
            </div>

            <div className="relative my-2">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <Button type="button" variant="secondary" size="sm" onClick={handleSmartDiagnose} disabled={isDiagnosing}>
                   {isDiagnosing ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                   ) : (
                    <Sparkles className="ml-2 h-4 w-4" />
                   )}
                  تشخيص ذكي
                </Button>
              </div>
            </div>

             <div className="space-y-2">
                <Label htmlFor="diagnosis">التشخيص</Label>
                <Input
                    id="diagnosis"
                    {...register("diagnosis", { required: "التشخيص مطلوب" })}
                    placeholder="مثال: التهاب اللوزتين، فحص دوري..."
                />
                {errors.diagnosis && <p className="text-red-500 text-xs mt-1">{errors.diagnosis.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="treatmentPlan">خطة العلاج المقترحة</Label>
                <Textarea
                    id="treatmentPlan"
                    {...register("treatmentPlan")}
                    placeholder="خطة العلاج التي يقترحها الذكاء الاصطناعي..."
                    rows={2}
                />
            </div>

             <div className="space-y-2">
                <Label htmlFor="followUp">توصية المتابعة</Label>
                <Input
                    id="followUp"
                    {...register("followUp")}
                    placeholder="مثال: حجز موعد متابعة خلال أسبوعين"
                />
            </div>

          </div>
          <DialogFooter className="flex-row-reverse">
            <Button type="button" variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button type="submit">حفظ السجل</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
