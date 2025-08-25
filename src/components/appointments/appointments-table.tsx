
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Pencil, Eye, CheckCircle, Clock, UserCheck, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Appointment, AppointmentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const statusConfig: Record<AppointmentStatus, { label: string; color: string; icon: React.ElementType }> = {
  مجدول: { label: 'مجدول', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
  'في الانتظار': { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: UserCheck },
  مكتمل: { label: 'مكتمل', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  عودة: { label: 'عودة', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckCircle },
  ملغي: { label: 'ملغي', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const allStatuses: AppointmentStatus[] = ['مجدول', 'في الانتظار', 'مكتمل', 'عودة', 'ملغي'];


interface AppointmentsTableProps {
  appointments: Appointment[];
  onCancel: (appointmentId: string) => void;
  onEdit: (appointment: Appointment) => void;
  onStatusChange: (appointmentId: string, newStatus: AppointmentStatus) => void;
}


export default function AppointmentsTable({
  appointments,
  onCancel,
  onEdit,
  onStatusChange
}: AppointmentsTableProps) {
  return (
    <Table dir="rtl">
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">المريض</TableHead>
          <TableHead className="text-right">الطبيب</TableHead>
          <TableHead className="text-right">التاريخ</TableHead>
          <TableHead className="text-right">الوقت</TableHead>
          <TableHead className="text-right">الحالة</TableHead>
          <TableHead className="text-center">الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                   <AvatarImage src={appointment.patientAvatar} alt={appointment.patientName} />
                  <AvatarFallback>{appointment.patientName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/patients/${appointment.patientId}`} className="font-medium hover:underline">{appointment.patientName}</Link>
                  <div className="text-sm text-muted-foreground">{appointment.reason}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{appointment.doctorName}</TableCell>
            <TableCell>{appointment.appointmentDate}</TableCell>
            <TableCell>{appointment.appointmentTime}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="outline" size="sm" className={cn("border-2 font-semibold", statusConfig[appointment.status]?.color)}>
                      {statusConfig[appointment.status]?.label}
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>تغيير الحالة</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={appointment.status} onValueChange={(newStatus) => onStatusChange(appointment.id, newStatus as AppointmentStatus)}>
                    {allStatuses.map(status => {
                       const Icon = statusConfig[status].icon;
                       return(
                          <DropdownMenuRadioItem key={status} value={status} className="cursor-pointer justify-end">
                              {statusConfig[status].label}
                              <Icon className="mr-2 h-4 w-4" />
                          </DropdownMenuRadioItem>
                       )
                    })}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
            <TableCell className="text-center">
               <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                         <Link href={`/patients/${appointment.patientId}`} className="flex justify-end w-full">
                           عرض ملف المريض
                            <Eye className="mr-2 h-4 w-4" />
                         </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(appointment)} className="justify-end">
                        تعديل الموعد
                         <Pencil className="mr-2 h-4 w-4" />
                      </DropdownMenuItem>
                      {appointment.status !== 'ملغي' && appointment.status !== 'مكتمل' && (
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 justify-end">
                            إلغاء الموعد
                            <Trash2 className="mr-2 h-4 w-4" />
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                   <AlertDialogContent dir="rtl">
                    <AlertDialogHeader className="text-right">
                      <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيؤدي هذا الإجراء إلى إلغاء موعد المريض <strong>{appointment.patientName}</strong>. لا يمكن التراجع عن هذا الإجراء.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row-reverse">
                      <AlertDialogAction onClick={() => onCancel(appointment.id)} className="bg-destructive hover:bg-destructive/90">
                        نعم، قم بالإلغاء
                      </AlertDialogAction>
                      <AlertDialogCancel>تراجع</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
         {appointments.length === 0 && (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    لا توجد مواعيد لعرضها.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
