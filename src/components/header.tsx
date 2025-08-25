import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import SmartSearch from '@/components/search';
import NotificationsMenu from './notifications-menu';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        <SmartSearch />
      </div>
      <div className="flex items-center gap-2">
        <NotificationsMenu />
      </div>
    </header>
  );
}
