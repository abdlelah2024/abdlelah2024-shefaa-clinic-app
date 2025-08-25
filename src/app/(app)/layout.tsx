
'use client';
import MainLayout from '@/components/main-layout';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// This is a simple client-side authentication check.
// In a real app, you'd use a more robust solution like context providers
// and possibly server-side checks.
const checkAuth = (): {isAuthenticated: boolean, user: User | null} => {
  if (typeof window !== 'undefined') {
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    return {isAuthenticated, user};
  }
  return {isAuthenticated: false, user: null};
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [auth, setAuth] = useState({isAuthenticated: false, user: null as User | null});
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const authStatus = checkAuth();
    setAuth(authStatus);
    if (!authStatus.isAuthenticated) {
      router.push('/login');
    }
    setIsCheckingAuth(false);
  }, [pathname, router]);

  // If not authenticated or still checking, show a loading spinner
  // to prevent flicker and ensure auth state is resolved.
  if (isCheckingAuth || !auth.isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return <MainLayout user={auth.user}>{children}</MainLayout>;
}
