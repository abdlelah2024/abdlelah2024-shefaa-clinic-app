
'use client';

import React, { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  UsersRound,
  Settings,
  LogOut,
  ChevronDown,
  LineChart,
  History
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { User, Permission } from '@/lib/types';

const allNavItems: { href: string; icon: React.ElementType; label: string; requiredPermission: Permission }[] = [
  { href: '/', icon: LayoutDashboard, label: 'اللوحة الرئيسية', requiredPermission: 'view_dashboard' },
  { href: '/appointments', icon: CalendarDays, label: 'المواعيد', requiredPermission: 'manage_appointments' },
  { href: '/patients', icon: Users, label: 'المرضى', requiredPermission: 'manage_patients' },
  { href: '/doctors', icon: Stethoscope, label: 'الأطباء', requiredPermission: 'manage_doctors' },
  { href: '/queue', icon: UsersRound, label: 'قائمة الانتظار', requiredPermission: 'view_queue' },
  { href: '/financials', icon: LineChart, label: 'المالية', requiredPermission: 'view_financials' },
  { href: '/activity', icon: History, label: 'سجل النشاط', requiredPermission: 'view_activity_log' },
  { href: '/settings', icon: Settings, label: 'الإعدادات', requiredPermission: 'manage_settings' },
];

export default function SidebarNavigation({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authenticated');
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const navItems = useMemo(() => {
    if (!user?.permissions) return [];
    const sortedNavItems = allNavItems.slice().sort((a, b) => {
        if (a.label === 'الإعدادات') return 1;
        if (b.label === 'الإعدادات') return -1;
        if (a.label === 'سجل النشاط') return 1;
        if (b.label === 'سجل النشاط') return -1;
        return 0;
    });
    return sortedNavItems.filter(item => user.permissions.includes(item.requiredPermission));
  }, [user]);

  if (!user) {
    return null; // Or a loading skeleton
  }

  return (
    <>
      <SidebarHeader className="p-4 text-right">
        <div className="flex items-center gap-3">
          <span className="font-headline text-lg font-semibold text-sidebar-foreground">
            مركز د. أحمد قايد سالم
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Stethoscope className="h-6 w-6" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href === '/' && pathname.startsWith('/'))}
                  tooltip={item.label}
                  className="flex justify-end"
                >
                  <span>{item.label}</span>
                  <item.icon className="ml-auto" />
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md p-2 text-right text-sm hover:bg-sidebar-accent">
               <ChevronDown className="h-4 w-4 text-sidebar-foreground/70" />
               <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium text-sidebar-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/70">
                  {user.role}
                </p>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person face" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
             <DropdownMenuItem asChild>
                <Link href="/settings" className="flex justify-end w-full">
                  <span>الملف الشخصي والإعدادات</span>
                  <Settings className="ml-2 h-4 w-4" />
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="justify-end">
              تسجيل الخروج
              <LogOut className="mr-2 h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}
