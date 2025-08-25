
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Appointment, AppointmentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

const statusStyles: Record<AppointmentStatus, string> = {
  مجدول: 'bg-blue-100 text-blue-800 border-blue-200',
  'في الانتظار': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  مكتمل: 'bg-green-100 text-green-800 border-green-200',
  عودة: 'bg-purple-100 text-purple-800 border-purple-200',
  ملغي: 'bg-red-100 text-red-800 border-red-200',
};

interface PatientAppointmentsListProps {
  appointments: Appointment[];
}

export default function PatientAppointmentsList({ appointments }: PatientAppointmentsListProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>تاريخ المواعيد</CardTitle>
        </CardHeader>
        <CardContent>
             <Table dir="rtl">
                <TableHeader>
                    <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوقت</TableHead>
                    <TableHead className="text-right">الطبيب</TableHead>
                    <TableHead className="text-right">السبب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                        <TableCell>{appointment.appointmentDate}</TableCell>
                        <TableCell>{appointment.appointmentTime}</TableCell>
                        <TableCell>{appointment.doctorName}</TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>
                        <Badge variant="outline" className={cn("border-2", statusStyles[appointment.status])}>
                            {appointment.status}
                        </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                    {appointments.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <Calendar className="h-8 w-8" />
                                    <span>لا توجد مواعيد لهذا المريض بعد.</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
