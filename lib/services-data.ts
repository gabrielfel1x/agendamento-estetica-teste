import type { SupabaseClient } from '@supabase/supabase-js';

export interface ServiceCategory {
  id:        string;
  name:      string;
  active:    boolean;
  sortOrder: number;
}

export interface Servico {
  id:           string;
  name:         string;
  price:        string;
  priceNum:     number;
  active:       boolean;
  sortOrder:    number;
  categoryId:   string | null;
  categoryName: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToServico(row: any): Servico {
  return {
    id:           row.id,
    name:         row.name,
    price:        row.price,
    priceNum:     row.price_num,
    active:       row.active,
    sortOrder:    row.sort_order,
    categoryId:   row.category_id   ?? null,
    categoryName: row.service_categories?.name ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCategory(row: any): ServiceCategory {
  return { id: row.id, name: row.name, active: row.active, sortOrder: row.sort_order };
}

export async function getCategories(client: SupabaseClient): Promise<ServiceCategory[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from('service_categories')
    .select('*')
    .order('sort_order')
    .order('name');
  if (error) console.error('[services] getCategories:', error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map(rowToCategory);
}

export async function getServicos(client: SupabaseClient): Promise<Servico[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from('procedures_catalog')
    .select('*, service_categories(name)')
    .order('sort_order')
    .order('name');
  if (error) console.error('[services] getServicos:', error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map(rowToServico);
}

export async function createCategory(
  payload: { name: string; sortOrder?: number }
): Promise<{ ok: boolean; error?: string; category?: ServiceCategory }> {
  try {
    const res  = await fetch('/api/admin/service-categories', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? 'Erro ao criar.' };
    return { ok: true, category: json.category };
  } catch {
    return { ok: false, error: 'Erro de conexão.' };
  }
}

export async function updateCategory(
  id: string,
  updates: { name?: string; active?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res  = await fetch('/api/admin/service-categories', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, ...updates }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? 'Erro ao atualizar.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Erro de conexão.' };
  }
}

export async function deleteCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res  = await fetch('/api/admin/service-categories', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? 'Erro ao excluir.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Erro de conexão.' };
  }
}

export async function createServico(
  payload: { name: string; priceNum: number; sortOrder?: number; categoryId?: string | null }
): Promise<{ ok: boolean; error?: string; servico?: Servico }> {
  try {
    const res  = await fetch('/api/admin/services', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? 'Erro ao criar.' };
    return { ok: true, servico: json.servico };
  } catch {
    return { ok: false, error: 'Erro de conexão.' };
  }
}

export async function updateServico(
  id: string,
  updates: { name?: string; priceNum?: number; active?: boolean; categoryId?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res  = await fetch('/api/admin/services', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, ...updates }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? 'Erro ao atualizar.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Erro de conexão.' };
  }
}

export async function deleteServico(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res  = await fetch('/api/admin/services', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? 'Erro ao excluir.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Erro de conexão.' };
  }
}
