import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface AdminAppointment {
  id: string
  patient: string
  phone: string
  procedure: string
  priceNum: number
  price: string
  date: string   // YYYY-MM-DD
  time: string   // HH:MM
  status: 'confirmado' | 'pendente' | 'cancelado'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAppointment(row: any): AdminAppointment {
  return {
    id:        row.id,
    patient:   row.patient,
    phone:     row.phone,
    procedure: row.procedure,
    priceNum:  row.price_num,
    price:     row.price,
    date:      row.date,
    time:      String(row.time).substring(0, 5), // HH:MM:SS → HH:MM
    status:    row.status,
  }
}

export async function getAppointmentsByDay(dateStr: string, client?: SupabaseClient): Promise<AdminAppointment[]> {
  const supabase = client ?? createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', dateStr)
    .order('time') as any
  if (error) console.error('[data] getAppointmentsByDay error:', error.message, error.code)
  if (!data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(rowToAppointment)
}

export async function getOccupancyByMonth(year: number, month: number, client?: SupabaseClient): Promise<Record<string, number>> {
  const supabase = client ?? createClient()
  const from    = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate() // último dia real do mês
  const to      = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from('appointments')
    .select('date')
    .gte('date', from)
    .lte('date', to)
    .neq('status', 'cancelado') as any
  if (error) console.error('[data] getOccupancyByMonth error:', error.message, error.code)
  if (!data) return {}
  const map: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of data as any[]) {
    map[row.date] = (map[row.date] || 0) + 1
  }
  return map
}

export async function getAllAppointments(client?: SupabaseClient): Promise<AdminAppointment[]> {
  const supabase = client ?? createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date')
    .order('time') as any
  if (error) console.error('[data] getAllAppointments error:', error.message, error.code)
  if (!data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(rowToAppointment)
}

export async function addAppointment(
  apt: Omit<AdminAppointment, 'id'>,
  clienteId?: string,
  client?: SupabaseClient
): Promise<AdminAppointment | null> {
  const supabase = client ?? createClient()
  const { data } = await supabase
    .from('appointments')
    .insert({
      patient:    apt.patient,
      phone:      apt.phone,
      procedure:  apt.procedure,
      price_num:  apt.priceNum,
      price:      apt.price,
      date:       apt.date,
      time:       apt.time,
      status:     apt.status,
      // created_by → profiles.id (auth user)
      // cliente_id → clientes.id (tabela separada) — não definir aqui para evitar FK violation
      ...(clienteId ? { created_by: clienteId } : {}),
    })
    .select()
    .single()
  if (!data) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rowToAppointment(data as any)
}

export async function updateAppointmentStatus(
  id: string,
  status: 'confirmado' | 'cancelado',
  client?: SupabaseClient
): Promise<boolean> {
  const supabase = client ?? createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) console.error('[data] updateAppointmentStatus error:', error.message)
  return !error
}

export async function updateAppointment(
  id: string,
  updates: {
    date?:      string
    time?:      string
    procedure?: string
    price?:     string
    priceNum?:  number
    status?:    'confirmado' | 'pendente' | 'cancelado'
  },
  client?: SupabaseClient
): Promise<boolean> {
  const supabase = client ?? createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = { updated_at: new Date().toISOString() }
  if (updates.date      !== undefined) payload.date      = updates.date
  if (updates.time      !== undefined) payload.time      = updates.time
  if (updates.procedure !== undefined) payload.procedure = updates.procedure
  if (updates.price     !== undefined) payload.price     = updates.price
  if (updates.priceNum  !== undefined) payload.price_num = updates.priceNum
  if (updates.status    !== undefined) payload.status    = updates.status
  const { error } = await supabase.from('appointments').update(payload).eq('id', id)
  if (error) console.error('[data] updateAppointment error:', error.message)
  return !error
}

export async function getClientAppointments(userId: string, client?: SupabaseClient): Promise<AdminAppointment[]> {
  const supabase = client ?? createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('created_by', userId)
    .order('date', { ascending: false }) as any
  if (error) console.error('[data] getClientAppointments error:', error.message)
  if (!data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(rowToAppointment)
}
