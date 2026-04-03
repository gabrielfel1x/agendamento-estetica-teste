import { createClient } from '@/lib/supabase/client';
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
  staffClient: SupabaseClient
): Promise<{ ok: boolean; error?: string; profile?: StaffProfile }> {
  // Use the regular (non-staff) client for signup so the admin's staff session is not affected
  const anonClient = createClient();
  const { data, error: signupError } = await anonClient.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (signupError) return { ok: false, error: signupError.message };
  if (!data.user)  return { ok: false, error: 'Erro ao criar usuário.' };

  const userId = data.user.id;

  // Sign out from the anon client immediately to avoid session pollution
  await anonClient.auth.signOut();

  // Upsert profile row using the authenticated staff client
  const { error: profileError } = await staffClient
    .from('profiles')
    .upsert({
      id:         userId,
      name,
      phone:      phone || null,
      role,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('[staff] createStaffUser profile upsert:', profileError.message);
    return { ok: false, error: 'Usuário criado, mas erro ao salvar perfil: ' + profileError.message };
  }

  return { ok: true, profile: { id: userId, name, phone, role } };
}
