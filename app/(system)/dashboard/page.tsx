'use client';

import { useAdminAuth } from '@/lib/admin-auth-context';
import OverviewSection from '@/components/admin/OverviewSection';

export default function DashboardPage() {
  const { user } = useAdminAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="sys-guard">
        <div className="sys-guard-inner">
          <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" className="sys-guard-icon">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <h2 className="sys-guard-title">Acesso restrito</h2>
          <p className="sys-guard-sub">Esta área é exclusiva para administradoras da clínica.</p>
        </div>
      </div>
    );
  }

  return <OverviewSection />;
}
