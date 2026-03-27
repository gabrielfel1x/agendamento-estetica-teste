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
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: async () => ({ error: null }),
  logout: async () => {},
  register: async () => ({ error: null }),
  updateUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  async function fetchProfile(id: string, email: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single() as { data: ProfileRow | null; error: unknown };

    if (data) {
      setUser({
        id: data.id,
        name: data.name,
        email,
        role: data.role,
        plan: data.plan ?? undefined,
        planStatus: data.plan_status ?? undefined,
        subscriptionDate: data.subscription_date ?? undefined,
        nextBillingDate: data.next_billing_date ?? undefined,
        monthlyValue: data.monthly_value ?? undefined,
      });
    }
    setLoaded(true);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? '');
      } else {
        setLoaded(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email ?? '');
        } else {
          setUser(null);
          setLoaded(true);
        }
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

  if (!loaded) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
