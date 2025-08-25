
'use client';

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Appointment, Doctor } from '@/lib/types';

interface DoctorRevenueTableProps {
  appointments: Appointment[];
  doctors: Doctor[];
}

export default function DoctorRevenueTable({ appointments, doctors }: DoctorRevenueTableProps) {
  const doctorRevenueData = useMemo(() => {
    const revenueMap = new Map<string, { totalRevenue: number; appointmentCount: number }>();

    appointments.forEach(apt => {
      if (apt.doctorId && apt.cost) {
        const currentData = revenueMap.get(apt.doctorId) || { totalRevenue: 0, appointmentCount: 0 };
        revenueMap.set(apt.doctorId, {
          totalRevenue: currentData.totalRevenue + apt.cost,
          appointmentCount: currentData.appointmentCount + 1,
        });
      }
    });

    return doctors.map(doctor => {
      const data = revenueMap.get(doctor.id) || { totalRevenue: 0, appointmentCount: 0 };
      return {
        ...doctor,
        ...data,
      };
    }).sort((a,b) => b.totalRevenue - a.totalRevenue);

  }, [appointments, doctors]);

  return (
    <Table dir="rtl">
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">الطبيب</TableHead>
          <TableHead className="text-right">التخصص</TableHead>
          <TableHead className="text-center">عدد المواعيد المكتملة</TableHead>
          <TableHead className="text-left">إجمالي الإيرادات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {doctorRevenueData.map((doctor) => (
          <TableRow key={doctor.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={doctor.avatar} alt={doctor.name} />
                  <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{doctor.name}</div>
              </div>
            </TableCell>
            <TableCell>{doctor.specialty}</TableCell>
            <TableCell className="text-center">{doctor.appointmentCount}</TableCell>
            <TableCell className="text-left font-semibold">{doctor.totalRevenue.toLocaleString()} ريال</TableCell>
          </TableRow>
        ))}
        {doctorRevenueData.length === 0 && (
            <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                    لا توجد بيانات إيرادات لعرضها.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
