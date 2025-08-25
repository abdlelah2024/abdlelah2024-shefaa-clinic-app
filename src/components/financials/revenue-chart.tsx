
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Appointment } from '@/lib/types';
import { format, subMonths, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';

interface RevenueChartProps {
    appointments: Appointment[];
}

const processChartData = (appointments: Appointment[]) => {
    if (appointments.length === 0) return [];
    
    const dates = appointments.map(a => parseISO(a.appointmentDate));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const interval = eachDayOfInterval({ start: minDate, end: maxDate });

    const dataByDay: { [key: string]: { date: string; revenue: number } } = {};

    interval.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        dataByDay[dayKey] = { date: dayKey, revenue: 0 };
    });

    appointments.forEach(apt => {
        if (apt.cost) {
            const dayKey = format(parseISO(apt.appointmentDate), 'yyyy-MM-dd');
            if (dataByDay[dayKey]) {
                dataByDay[dayKey].revenue += apt.cost;
            }
        }
    });

    return Object.values(dataByDay);
};


const chartConfig = {
  revenue: {
    label: 'الإيرادات',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function RevenueChart({ appointments }: RevenueChartProps) {
  const chartData = processChartData(appointments);

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => format(parseISO(value), "MMM d")}
        />
        <YAxis
            tickFormatter={(value) => `${Number(value).toLocaleString()}`}
            label={{ value: 'ريال', position: 'insideTopLeft', offset: -10, className: 'fill-muted-foreground text-xs' }}
        />
        <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent
                formatter={(value, name, props) => [`${Number(value).toLocaleString()} ريال`, `الإيرادات`]}
                labelFormatter={(label) => format(parseISO(label), "eeee, d MMMM yyyy", { locale: ar })}
                indicator="dot" 
            />}
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
