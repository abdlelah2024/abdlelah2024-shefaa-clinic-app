
'use client';

import { Bell, Calendar, UserCheck, Check, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "./ui/dropdown-menu";
import { appointments } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import React from "react";
import { Badge } from "./ui/badge";

// Mock notifications for demonstration
const getNotifications = () => {
    const now = new Date();
    const upcomingAppointment = appointments.find(a => 
        new Date(a.appointmentDate).setHours(
            parseInt(a.appointmentTime.split(':')[0]), 
            parseInt(a.appointmentTime.split(':')[1])
        ) > now.getTime() && a.status === 'مجدول'
    );

    const waitingPatient = appointments.find(a => a.status === 'في الانتظار');

    const notifications = [];

    if (upcomingAppointment) {
        const appointmentTime = new Date(upcomingAppointment.appointmentDate);
        const [hours, minutes] = upcomingAppointment.appointmentTime.split(':');
        appointmentTime.setHours(Number(hours), Number(minutes));

        notifications.push({
            id: 'notif1',
            type: 'appointment',
            title: `تذكير بموعد: ${upcomingAppointment.patientName}`,
            description: `يبدأ الموعد ${formatDistanceToNow(appointmentTime, { addSuffix: true, locale: ar })}.`,
            href: '/appointments'
        });
    }

    if (waitingPatient) {
         notifications.push({
            id: 'notif2',
            type: 'queue',
            title: 'مريض في الانتظار',
            description: `${waitingPatient.patientName} ينتظر بدء الكشف.`,
            href: '/queue'
        });
    }
    
    notifications.push({
        id: 'notif3',
        type: 'system',
        title: 'تم تحديث النظام',
        description: 'تمت إضافة ميزة الإشعارات التفاعلية.',
        href: '/settings'
    });

    return notifications;
}

const notificationIcons: Record<string, React.ElementType> = {
    appointment: Calendar,
    queue: UserCheck,
    system: Bell
}


export default function NotificationsMenu() {
    const notifications = getNotifications();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
                <DropdownMenuLabel className="flex items-center justify-between px-2 py-2">
                    <span className="font-bold">الإشعارات</span>
                    <Badge variant="secondary" className="text-xs">{notifications.length}</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.map(notification => {
                            const Icon = notificationIcons[notification.type] || Bell;
                            return (
                                <DropdownMenuItem key={notification.id} asChild className="p-0">
                                    <Link href={notification.href} className="group/item flex items-start gap-3 p-3 transition-colors hover:bg-muted/50 w-full">
                                         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                             <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{notification.title}</p>
                                            <p className="text-xs text-muted-foreground">{notification.description}</p>
                                        </div>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="absolute top-1 right-1 h-6 w-6 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem>
                                                    <Check className="ml-2 h-4 w-4" />
                                                    تمييز كمقروء
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </Link>
                                </DropdownMenuItem>
                            )
                        })}
                    </div>
                ) : (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        لا توجد إشعارات جديدة.
                    </div>
                )}
                 {notifications.length > 0 && (
                    <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center justify-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                        <Trash2 className="h-4 w-4" />
                        مسح كل الإشعارات
                    </DropdownMenuItem>
                    </>
                 )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
