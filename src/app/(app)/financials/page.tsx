
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Doctor, Appointment } from '@/lib/types';
import { DollarSign, BarChart2, Filter, Loader2 } from 'lucide-react';
import RevenueChart from "@/components/financials/revenue-chart";
import DoctorRevenueTable from "@/components/financials/doctor-revenue-table";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { subDays, isWithinInterval, parseISO } from 'date-fns';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-right">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-right">
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function FinancialsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
            const appointmentsList = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
            setAppointments(appointmentsList);

            const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
            const doctorsList = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
            setDoctors(doctorsList);
        } catch (error) {
            console.error("Error fetching financial data:", error);
            toast({
                title: "خطأ في تحميل البيانات",
                description: "لم نتمكن من جلب البيانات المالية.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const filteredAppointments = useMemo(() => {
        return appointments.filter(a => {
            if (a.status !== 'مكتمل' || !a.cost) return false;

            const appointmentDate = parseISO(a.appointmentDate);
            const isDateInRange = dateRange?.from && dateRange?.to ? 
                isWithinInterval(appointmentDate, { start: dateRange.from, end: dateRange.to }) : true;

            const isDoctorMatch = selectedDoctorId === 'all' || a.doctorId === selectedDoctorId;

            return isDateInRange && isDoctorMatch;
        });
    }, [appointments, dateRange, selectedDoctorId]);
    
    const totalRevenue = filteredAppointments.reduce((sum, a) => sum + (a.cost ?? 0), 0);
    const averageRevenuePerAppointment = filteredAppointments.length > 0
        ? totalRevenue / filteredAppointments.length
        : 0;

    const handleResetFilters = () => {
        setDateRange({ from: subDays(new Date(), 29), to: new Date() });
        setSelectedDoctorId('all');
    }
    
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    return (
        <div className="flex flex-col gap-8" dir="rtl">
            <div className="text-right">
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    التقارير المالية
                </h1>
                <p className="text-muted-foreground">
                    تحليل شامل لإيرادات وأداء العيادة المالي.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        خيارات الفلترة
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <div className="flex flex-col gap-2 text-right">
                           <label className="text-sm font-medium">نطاق التاريخ</label>
                           <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                        </div>
                        <div className="flex flex-col gap-2 text-right">
                           <label className="text-sm font-medium">الطبيب</label>
                            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId} dir="rtl">
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر طبيب..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">كل الأطباء</SelectItem>
                                    {doctors.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="flex justify-start gap-2 mt-4">
                        <Button onClick={handleResetFilters} variant="outline">إعادة تعيين الفلاتر</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="إجمالي الإيرادات" 
                    value={`${totalRevenue.toLocaleString()} ريال`}
                    icon={DollarSign} 
                />
                <StatCard 
                    title="متوسط الإيراد لكل موعد" 
                    value={`${averageRevenuePerAppointment.toFixed(2)} ريال`}
                    icon={BarChart2} 
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="lg:col-span-2 text-right">
                    <CardHeader>
                        <CardTitle className="font-headline">نظرة عامة على الإيرادات</CardTitle>
                        <CardDescription>
                            عرض الإيرادات المجمعة من المواعيد المكتملة بناءً على الفلاتر المحددة.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                       <RevenueChart appointments={filteredAppointments} />
                    </CardContent>
                </Card>
            </div>

             <Card className="text-right">
                <CardHeader>
                    <CardTitle className="font-headline">إيرادات الأطباء</CardTitle>
                    <CardDescription>
                       تفصيل إجمالي الإيرادات وعدد المواعيد المكتملة لكل طبيب بناء على الفلاتر.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DoctorRevenueTable appointments={filteredAppointments} doctors={doctors} />
                </CardContent>
            </Card>

        </div>
    );
}
