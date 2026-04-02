'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import SystemSidebar from '@/components/system/SystemSidebar';

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  const { user, loaded } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (loaded && !user) {
      router.replace('/acesso');
    }
  }, [loaded, user, router]);

  // Aguarda sessão ou redireciona — nunca retorna null (causaria tela branca)
  if (!loaded || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--ivory)' }}>
        <span className="login-spinner" />
      </div>
    );
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
