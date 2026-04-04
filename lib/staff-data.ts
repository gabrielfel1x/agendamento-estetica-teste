import type { SupabaseClient } from '@supabase/supabase-js';

export interface StaffProfile {
  id: string;
  name: string;
  phone: string | null;
  role: 'admin' | 'funcionario';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToStaff(row: any): StaffProfile {
  return {
    id:    row.id,
    name:  row.name,
    phone: row.phone ?? null,
    role:  row.role as 'admin' | 'funcionario',
  };
}

export async function getStaffProfiles(client: SupabaseClient): Promise<StaffProfile[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await client
    .from('profiles')
    .select('id, name, phone, role')
    .in('role', ['admin', 'funcionario'])
    .order('name') as any;
  if (error) console.error('[staff] getStaffProfiles:', error.message);
  if (!data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(rowToStaff);
}

export async function updateStaffProfile(
  id: string,
  updates: { name?: string; phone?: string | null },
  client: SupabaseClient,
): Promise<boolean> {
  const { error } = await client
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) console.error('[staff] updateStaffProfile:', error.message);
  return !error;
}

export async function deleteStaffProfile(
  id: string,
  _client?: SupabaseClient,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type: 'staff' }),
    })
    const json = await res.json()
    if (!res.ok) return { ok: false, error: json.error ?? 'Erro ao excluir.' }
    return { ok: true }
  } catch (e) {
    console.error('[staff] deleteStaffProfile:', e)
    return { ok: false, error: 'Erro de conexão.' }
  }
}

export async function createStaffUser(
  email: string,
  password: string,
  name: string,
  phone: string | null,
  role: 'admin' | 'funcionario',
  _staffClient?: SupabaseClient
): Promise<{ ok: boolean; error?: string; profile?: StaffProfile }> {
  try {
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone, role }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? 'Erro ao criar funcionária.' };
    return { ok: true, profile: json.profile };
  } catch (e) {
    console.error('[staff] createStaffUser:', e);
    return { ok: false, error: 'Erro de conexão.' };
  }
}
