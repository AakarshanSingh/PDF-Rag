'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, hydrateDone } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !hydrateDone) return;

    const publicPaths = ['/login', '/signup', '/verify'];
    if (!token && !publicPaths.includes(pathname)) {
      router.push('/login');
    } else if (token && publicPaths.includes(pathname)) {
      router.push('/');
    }
  }, [token, hydrateDone, pathname, router, mounted]);

  if (!mounted || !hydrateDone) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }
  
  const publicPaths = ['/login', '/signup', '/verify'];
  if (!token && !publicPaths.includes(pathname)) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Redirecting...</div>;
  }

  return <>{children}</>;
}
