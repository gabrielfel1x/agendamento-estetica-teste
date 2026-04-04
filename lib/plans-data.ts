import type { SupabaseClient } from '@supabase/supabase-js';

export interface PlanData {
  id:          string;
  slug:        string;
  name:        string;
  price:       string;
  priceNum:    number;
  description: string;
  popular:     boolean;
  active:      boolean;
  sortOrder:   number;
  features:    string[]; // de plan_features, ordenadas por sort_order
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPlan(row: any): PlanData {
  return {
    id:          row.id,
    slug:        row.slug,
    name:        row.name,
    price:       row.price,
    priceNum:    row.price_num,
    description: row.description ?? '',
    popular:     row.popular,
    active:      row.active,
    sortOrder:   row.sort_order,
    features:    (row.plan_features ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((f: any) => f.description as string),
  };
}

export async function getPlans(client: SupabaseClient): Promise<PlanData[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from('plans')
    .select('*, plan_features(id, description, sort_order)')
    .order('sort_order');
  if (error) console.error('[plans] getPlans:', error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map(rowToPlan);
}

export async function createPlan(
  payload: {
    name:        string;
    priceNum:    number;
    description: string;
    popular:     boolean;
    features:    string[];
    sortOrder?:  number;
  }
): Promise<{ ok: boolean; error?: string; plan?: PlanData }> {
  try {
    const res  = await fetch('/api/admin/plans', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? 'Erro ao criar.' };
    return { ok: true, plan: json.plan };
  } catch {
    return { ok: false, error: 'Erro de conexão.' };
  }
}

export async function updatePlan(
  id: string,
  payload: {
    name?:        string;
    priceNum?:    number;
    description?: string;
    popular?:     boolean;
    active?:      boolean;
    features?:    string[];
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res  = await fetch('/api/admin/plans', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, ...payload }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? 'Erro ao atualizar.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Erro de conexão.' };
  }
}

export async function deletePlan(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res  = await fetch('/api/admin/plans', {
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
