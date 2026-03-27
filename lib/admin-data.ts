import { createClient } from '@/lib/supabase/client'

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

export async function getAppointmentsByDay(dateStr: string): Promise<AdminAppointment[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', dateStr)
    .order('time')
  if (!data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(rowToAppointment)
}

export async function getOccupancyByMonth(year: number, month: number): Promise<Record<string, number>> {
  const supabase = createClient()
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const to   = `${year}-${String(month).padStart(2, '0')}-31`
  const { data } = await supabase
    .from('appointments')
    .select('date')
    .gte('date', from)
    .lte('date', to)
    .neq('status', 'cancelado')
  if (!data) return {}
  const map: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of data as any[]) {
    map[row.date] = (map[row.date] || 0) + 1
  }
  return map
}

export async function getAllAppointments(): Promise<AdminAppointment[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('appointments')
    .select('*')
    .order('date')
    .order('time')
  if (!data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(rowToAppointment)
}

export async function addAppointment(apt: Omit<AdminAppointment, 'id'>): Promise<AdminAppointment | null> {
  const supabase = createClient()
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
    })
    .select()
    .single()
  if (!data) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rowToAppointment(data as any)
}
