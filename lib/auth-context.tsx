'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ProfileRow } from '@/lib/supabase/types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'funcionario' | 'cliente';
  plan?: string;
  planStatus?: 'ativo' | 'pendente' | 'cancelado';
  subscriptionDate?: string;
  nextBillingDate?: string;
  monthlyValue?: string;
}

interface AuthCtx {
  user: User | null;
  loaded: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loaded: false,
  login: async () => ({ error: null }),
  logout: async () => {},
  register: async () => ({ error: null }),
  updateUser: async () => {},
});

// Extrai o role do JWT (app_metadata tem prioridade pois é definido pelo servidor)
function roleFromJwt(u: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }): User['role'] {
  return (
    (u.app_metadata?.role as User['role']) ||
    (u.user_metadata?.role as User['role']) ||
    'cliente'
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  // Enriquece o usuário com dados do DB (role real, plano, etc.)
  // Roda em background — o usuário já está definido pelo JWT antes desta chamada
  async function enrichFromProfile(id: string, email: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.warn('[auth] profile fetch error:', error.message, '— mantendo dados do JWT');
        // Tenta criar o perfil se não existir (requer política INSERT)
        if (error.code === 'PGRST116') {
          setUser(prev => {
            if (!prev) return prev;
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            (supabase.from('profiles') as unknown as { upsert: (v: unknown, o: unknown) => Promise<unknown> })
              .upsert({ id, name: prev.name, role: prev.role }, { onConflict: 'id' });
            return prev;
          });
        }
        return;
      }

      if (data) {
        console.log('[auth] profile OK, role =', data.role);
        const d = data as ProfileRow;
        setUser({
          id: d.id,
          name: d.name,
          email,
          role: d.role as User['role'],
          plan: d.plan ?? undefined,
          planStatus: (d.plan_status as User['planStatus']) ?? undefined,
          subscriptionDate: d.subscription_date ?? undefined,
          nextBillingDate: d.next_billing_date ?? undefined,
          monthlyValue: d.monthly_value ?? undefined,
        });
      }
    } catch (err) {
      console.warn('[auth] enrichFromProfile caught:', err instanceof Error ? err.message : err);
    }
  }

  useEffect(() => {
    console.log('[auth] init');
    let resolved = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[auth] event:', event, '|', session?.user?.email ?? 'no-user');

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (event === 'INITIAL_SESSION' && resolved) return;
          resolved = true;

          if (session?.user) {
            const u = session.user;
            // Fase 1: define usuário imediatamente a partir do JWT (sem esperar DB)
            const initialUser: User = {
              id: u.id,
              email: u.email ?? '',
              name: (u.user_metadata?.name as string) || (u.email ?? '').split('@')[0],
              role: roleFromJwt(u),
            };
            console.log('[auth] user from JWT, role =', initialUser.role);
            setUser(initialUser);
            setLoaded(true);
            // Fase 2: enriquece com dados reais do perfil em background
            enrichFromProfile(u.id, u.email ?? '');
          } else {
            setUser(null);
            setLoaded(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoaded(true);
        }
        // TOKEN_REFRESHED, USER_UPDATED, etc. ignorados intencionalmente
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'E-mail ou senha incorretos.' };
    return { error: null };
  }

  async function register(name: string, email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'cliente' } },
    });
    if (error) {
      if (error.message.toLowerCase().includes('already')) return { error: 'Este e-mail já está em uso.' };
      return { error: error.message };
    }
    return { error: null };
  }

  async function updateUser(updates: Partial<User>): Promise<void> {
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileUpdates: Record<string, any> = {};
    if (updates.name !== undefined)              profileUpdates.name               = updates.name;
    if (updates.plan !== undefined)              profileUpdates.plan               = updates.plan;
    if (updates.planStatus !== undefined)        profileUpdates.plan_status        = updates.planStatus;
    if (updates.subscriptionDate !== undefined)  profileUpdates.subscription_date  = updates.subscriptionDate;
    if (updates.nextBillingDate !== undefined)   profileUpdates.next_billing_date  = updates.nextBillingDate;
    if (updates.monthlyValue !== undefined)      profileUpdates.monthly_value      = updates.monthlyValue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('profiles') as any).update(profileUpdates).eq('id', user.id);
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    // onAuthStateChange cuida de setar user = null
  }

  return (
    <AuthContext.Provider value={{ user, loaded, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
