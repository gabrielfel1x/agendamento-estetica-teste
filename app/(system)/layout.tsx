'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import SystemSidebar from '@/components/system/SystemSidebar';

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router   = useRouter();

  useEffect(() => {
    if (user === null) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="admin-layout">
      <SystemSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
