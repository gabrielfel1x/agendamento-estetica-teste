'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { createStaffClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProfileRow } from '@/lib/supabase/types';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'funcionario';
}

interface AdminAuthCtx {
  user: StaffUser | null;
  loaded: boolean;
  supabase: SupabaseClient;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthCtx>({
  user: null,
  loaded: false,
  supabase: null as unknown as SupabaseClient,
  login: async () => ({ error: null }),
  logout: async () => {},
});

function roleFromJwt(u: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }): string {
  return (
    (u.app_metadata?.role as string) ||
    (u.user_metadata?.role as string) ||
    'cliente'
  );
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const supabase = useMemo(() => createStaffClient(), []);

  async function enrichFromProfile(id: string, email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.warn('[admin-auth] profile fetch error:', error.message);
        return false;
      }

      if (data) {
        const d = data as ProfileRow;
        const role = d.role as string;
        if (role === 'admin' || role === 'funcionario') {
          setUser({ id: d.id, name: d.name, email, role: role as StaffUser['role'] });
          return true;
        } else {
          console.warn('[admin-auth] profile role é cliente, ignorando');
          await supabase.auth.signOut();
          setUser(null);
          return false;
        }
      }
      return false;
    } catch (err) {
      console.warn('[admin-auth] enrichFromProfile caught:', err instanceof Error ? err.message : err);
      return false;
    }
  }

  useEffect(() => {
    let resolved = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (event === 'INITIAL_SESSION' && resolved) return;
          resolved = true;

          if (session?.user) {
            const u = session.user;
            // Sempre consulta o DB para obter o role real (JWT pode não ter)
            enrichFromProfile(u.id, u.email ?? '').then(accepted => {
              if (!accepted) {
                setUser(null);
              }
              setLoaded(true);
            });
          } else {
            setUser(null);
            setLoaded(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoaded(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string): Promise<{ error: string | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'E-mail ou senha incorretos.' };

    // Verifica o role real no banco (JWT pode não conter o role)
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = (profile?.role as string) ?? 'cliente';
      if (role !== 'admin' && role !== 'funcionario') {
        await supabase.auth.signOut();
        return { error: 'Acesso restrito. Esta área é exclusiva para funcionárias.' };
      }
    }

    return { error: null };
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  return (
    <AdminAuthContext.Provider value={{ user, loaded, supabase, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
