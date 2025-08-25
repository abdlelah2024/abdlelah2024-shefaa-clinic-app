
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { format, subMonths, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import type { Appointment } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

const processChartData = (appointments: Appointment[]) => {
    const data: { [key: string]: { month: string; completed: number; scheduled: number } } = {};
    const sixMonthsAgo = subMonths(new Date(), 5);

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
        const monthDate = subMonths(new Date(), i);
        const monthKey = format(monthDate, 'yyyy-MM');
        const monthName = format(monthDate, 'MMMM', { locale: ar });
        if (!data[monthKey]) {
            data[monthKey] = { month: monthName, completed: 0, scheduled: 0 };
        }
    }
    
    appointments.forEach(apt => {
        const aptDate = parseISO(apt.appointmentDate);
        if (aptDate >= sixMonthsAgo) {
            const monthKey = format(aptDate, 'yyyy-MM');
             if (data[monthKey]) {
                if (apt.status === 'مكتمل') {
                    data[monthKey].completed += 1;
                } else if (apt.status === 'مجدول' || apt.status === 'في الانتظار') {
                    data[monthKey].scheduled += 1;
                }
            }
        }
    });

    return Object.values(data).reverse();
};


const chartConfig = {
  completed: {
    label: 'مكتمل',
    color: 'hsl(var(--primary))',
  },
  scheduled: {
    label: 'مجدول',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export default function AppointmentsOverviewChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointmentData = async () => {
        setIsLoading(true);
        try {
            const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
            const appointmentsList = appointmentsSnapshot.docs.map(doc => doc.data() as Appointment);
            const processedData = processChartData(appointmentsList);
            setChartData(processedData);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchAppointmentData();
  }, []);

  if (isLoading) {
    return (
        <div className="flex h-[280px] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
        <Bar dataKey="scheduled" fill="var(--color-scheduled)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
