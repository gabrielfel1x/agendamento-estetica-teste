'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import SystemSidebar from '@/components/system/SystemSidebar';
import AdminSkeleton from '@/components/system/AdminSkeleton';

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  const { user, loaded } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (loaded && !user) {
      router.replace('/acesso');
    }
  }, [loaded, user, router]);

  // Enquanto verifica sessão, mostra skeleton do layout completo
  if (!loaded || !user) {
    return <AdminSkeleton />;
  }

  return (
    <div className="admin-layout">
      <SystemSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
