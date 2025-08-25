
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
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Patient } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';


export default function PatientsTable({
  patients,
  onBookAppointment,
  onEdit,
}: {
  patients: Patient[];
  onBookAppointment: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
}) {
  return (
    <div className="border rounded-lg">
    <Table dir="rtl">
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">الاسم</TableHead>
          <TableHead className="text-right">رقم الهاتف</TableHead>
          <TableHead className="text-right">العمر</TableHead>
          <TableHead className="text-right">تاريخ الانضمام</TableHead>
          <TableHead className="text-left">الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={patient.avatar} alt={patient.name} />
                  <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/patients/${patient.id}`} className="hover:underline">
                    <div className="font-medium">{patient.name}</div>
                  </Link>
                </div>
              </div>
            </TableCell>
            <TableCell>{patient.phone}</TableCell>
            <TableCell>{patient.age}</TableCell>
            <TableCell>{format(new Date(patient.createdAt), 'yyyy-MM-dd')}</TableCell>
            <TableCell className="text-left">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">فتح القائمة</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                     <Link href={`/patients/${patient.id}`}>عرض السجل الطبي</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(patient)}>تعديل البيانات</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBookAppointment(patient)}>حجز موعد جديد</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
         {patients.length === 0 && (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    لا يوجد مرضى لعرضهم.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
}
