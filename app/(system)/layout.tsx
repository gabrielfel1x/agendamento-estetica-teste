'use client';

import { useAuth } from '@/lib/auth-context';
import SystemSidebar from '@/components/system/SystemSidebar';

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

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
