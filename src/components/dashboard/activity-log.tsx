
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { activityLogs } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { UserPlus, CalendarPlus, ShieldCheck, Edit, User, Stethoscope, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';

const actionIcons: { [key: string]: React.ElementType } = {
  'تحديث صلاحيات': ShieldCheck,
  'إضافة مريض جديد': UserPlus,
  'إضافة سجل طبي': Edit,
  'تعديل موعد': CalendarPlus,
  'إضافة طبيب جديد': Stethoscope,
  'إضافة مستخدم جديد': User,
};


export default function ActivityLog() {
  
  // This component still uses static data.
  // In a real app, you would fetch this from Firestore.
  const isLoading = false; 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activityLogs.map((log) => {
          const Icon = actionIcons[log.action] || Edit;
          return (
            <div className="flex items-start" key={log.id}>
                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mr-4 flex-1 space-y-1">
                <p className="text-sm leading-snug">
                    <span className="font-semibold">{log.user.name}</span>
                    {' '}{log.action}{' '}<span className="font-semibold">{log.target}</span>.
                </p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ar })}
                </p>
                </div>
            </div>
          )
        })}
    </div>
  );
}
