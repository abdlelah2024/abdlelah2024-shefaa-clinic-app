
import React from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import SidebarNavigation from '@/components/sidebar-nav';
import AppHeader from '@/components/header';
import type { User } from '@/lib/types';

export default function MainLayout({ children, user }: { children: React.ReactNode, user: User | null }) {
  // Reading cookies on the server is not straightforward in App Router.
  // For this static example, we default to open. In a real app,
  // you might handle this differently, perhaps with a client component
  // that reads the cookie and updates the state.
  const isSidebarOpen = true; 

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
          <SidebarNavigation user={user}/>
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
