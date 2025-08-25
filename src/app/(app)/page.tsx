
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Users,
  CalendarCheck2,
  Activity,
  Loader2,
} from 'lucide-react';
import AppointmentsOverviewChart from '@/components/dashboard/appointments-overview-chart';
import UpcomingAppointments from '@/components/dashboard/upcoming-appointments';
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Appointment } from '@/lib/types';

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
}) => (
  <Card className="text-right">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      setIsLoading(true);
      try {
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('appointmentDate', '==', todayStr)
        );
        const querySnapshot = await getDocs(appointmentsQuery);
        const appointmentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        setTodaysAppointments(appointmentsList);
      } catch (error) {
        console.error("Error fetching today's appointments: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaysAppointments();
  }, [todayStr]);

  const stats = useMemo(() => {
    const todaysRevenue = todaysAppointments
      .filter(a => a.status === 'مكتمل' && a.cost)
      .reduce((sum, a) => sum + (a.cost ?? 0), 0);
    
    const scheduledTodayCount = todaysAppointments.filter(
      (a) => a.status === 'مجدول' || a.status === 'في الانتظار'
    ).length;

    const patientsTodayCount = new Set(todaysAppointments.map(a => a.patientId)).size;
    
    const totalCompletedToday = todaysAppointments.filter(a => a.status === 'مكتمل').length;

    return {
      todaysRevenue,
      scheduledTodayCount,
      patientsTodayCount,
      totalCompletedToday,
    };
  }, [todaysAppointments]);

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <div className="text-right">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          اللوحة الرئيسية
        </h1>
        <p className="text-muted-foreground">
          نظرة عامة على نشاط عيادتك اليوم.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => <Card key={i} className="h-28"><CardContent className="p-6 flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary"/></CardContent></Card>)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="إيرادات اليوم"
            value={`${stats.todaysRevenue.toLocaleString()} ريال`}
            icon={DollarSign}
            description="بناءً على المواعيد المكتملة اليوم"
          />
          <StatCard
            title="المواعيد القادمة اليوم"
            value={`${stats.scheduledTodayCount}`}
            icon={CalendarCheck2}
            description="المواعيد المجدولة وفي الانتظار"
          />
          <StatCard
            title="مرضى اليوم"
            value={`${stats.patientsTodayCount}`}
            icon={Users}
            description="إجمالي عدد المرضى لهذا اليوم"
          />
          <StatCard
            title="المواعيد المكتملة اليوم"
            value={`${stats.totalCompletedToday}`}
            icon={Activity}
            description="إجمالي المواعيد التي تم إنجازها"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 text-right">
          <CardHeader>
            <CardTitle className="font-headline">نظرة عامة على المواعيد (آخر 6 أشهر)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <AppointmentsOverviewChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 text-right">
          <CardHeader>
            <CardTitle className="font-headline">المواعيد القادمة اليوم</CardTitle>
            <CardDescription>
              أهم المواعيد المجدولة لهذا اليوم.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingAppointments appointments={todaysAppointments} isLoading={isLoading}/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
