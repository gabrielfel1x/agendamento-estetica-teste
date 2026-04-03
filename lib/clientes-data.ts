import { createClient } from '@/lib/supabase/client';
import { AdminAppointment, getAppointmentsByDay, getAllAppointments } from './admin-data';
import type { SupabaseClient } from '@supabase/supabase-js';

export type { AdminAppointment };

export interface Cliente {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  since: string; // YYYY-MM-DD
  notes: string | null;
  profileId: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCliente(row: any): Cliente {
  return {
    id:        row.id,
    name:      row.name,
    phone:     row.phone,
    email:     row.email   ?? null,
    since:     row.since,
    notes:     row.notes   ?? null,
    profileId: row.profile_id ?? null,
  };
}

export async function getClientes(client?: SupabaseClient): Promise<Cliente[]> {
  const supabase = client ?? createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('name') as any;
  if (error) console.error('[data] getClientes error:', error.message);
  if (!data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(rowToCliente);
}

export async function addCliente(
  c: { name: string; phone: string; email?: string; notes?: string },
  client?: SupabaseClient
): Promise<Cliente | null> {
  const supabase = client ?? createClient();
  const { data } = await supabase
    .from('clientes')
    .insert({ name: c.name, phone: c.phone, email: c.email ?? null, notes: c.notes ?? null })
    .select()
    .single();
  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rowToCliente(data as any);
}

export async function updateCliente(
  id: string,
  updates: { name?: string; phone?: string; email?: string | null; notes?: string | null },
  client?: SupabaseClient
): Promise<boolean> {
  const supabase = client ?? createClient();
  const { error } = await supabase
    .from('clientes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) console.error('[data] updateCliente error:', error.message);
  return !error;
}

export async function deleteCliente(id: string, client?: SupabaseClient): Promise<boolean> {
  const supabase = client ?? createClient();
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) console.error('[data] deleteCliente error:', error.message);
  return !error;
}

// Re-exporta para uso nos componentes de cliente
export { getAppointmentsByDay };
