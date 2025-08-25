import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Loader2 } from 'lucide-react';
import type { Appointment } from '@/lib/types';

export default function UpcomingAppointments({ appointments, isLoading }: { appointments: Appointment[], isLoading: boolean }) {
    const upcoming = appointments
        .filter(a => a.status === 'مجدول' || a.status === 'في الانتظار')
        .sort((a,b) => a.appointmentTime.localeCompare(b.appointmentTime))
        .slice(0, 5);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {upcoming.length > 0 ? (
        upcoming.map((appointment) => (
          <div className="flex items-center" key={appointment.id}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={appointment.patientAvatar} alt={appointment.patientName} />
              <AvatarFallback>{appointment.patientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mr-4 flex-1 space-y-1">
              <p className="font-medium leading-none">{appointment.patientName}</p>
              <p className="text-sm text-muted-foreground">
                مع {appointment.doctorName}
              </p>
            </div>
            <div className="font-medium text-primary">{appointment.appointmentTime}</div>
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-2">
            <Calendar className="h-10 w-10"/>
            <span>لا توجد مواعيد قادمة اليوم.</span>
        </div>
      )}
    </div>
  );
}
