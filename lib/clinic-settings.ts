import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ClinicSettings {
  active_weekdays: number[]  // JS getDay(): 0=Dom, 1=Seg … 6=Sáb
  start_hour:      string    // "08:00"
  end_hour:        string    // "18:00"
  slot_interval:   number    // minutos: 15 | 30 | 45 | 60
  blocked_dates:   string[]  // "YYYY-MM-DD"
}

export const DEFAULT_SETTINGS: ClinicSettings = {
  active_weekdays: [1, 2, 3, 4, 5, 6], // Seg–Sáb
  start_hour:      '08:00',
  end_hour:        '18:00',
  slot_interval:   30,
  blocked_dates:   [],
}

/** Gera slots de horário entre start_hour e end_hour com o intervalo dado */
export function generateTimes(
  startHour:    string,
  endHour:      string,
  slotInterval: number
): string[] {
  const [sh, sm] = startHour.split(':').map(Number)
  const [eh, em] = endHour.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin   = eh * 60 + em
  const times: string[] = []
  for (let m = startMin; m < endMin; m += slotInterval) {
    const h = Math.floor(m / 60)
    const min = m % 60
    times.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
  }
  return times
}

/** Cache em memória (por sessão do browser) para evitar fetches redundantes */
let _cache: ClinicSettings | null = null

export function invalidateSettingsCache() {
  _cache = null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSettings(data: any): ClinicSettings {
  return {
    active_weekdays: data.active_weekdays ?? DEFAULT_SETTINGS.active_weekdays,
    start_hour:      data.start_hour      ?? DEFAULT_SETTINGS.start_hour,
    end_hour:        data.end_hour        ?? DEFAULT_SETTINGS.end_hour,
    slot_interval:   data.slot_interval   ?? DEFAULT_SETTINGS.slot_interval,
    blocked_dates:   (data.blocked_dates  ?? []).map((d: string) => String(d).slice(0, 10)),
  }
}

export async function getClinicSettings(client?: SupabaseClient): Promise<ClinicSettings> {
  if (_cache) return _cache
  const supabase = client ?? createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from('clinic_settings')
    .select('*')
    .eq('id', 'default')
    .single() as any
  if (error || !data) return { ...DEFAULT_SETTINGS }
  _cache = rowToSettings(data)
  return _cache
}

export async function saveClinicSettings(
  settings: ClinicSettings,
  client?: SupabaseClient
): Promise<boolean> {
  const supabase = client ?? createClient()
  const { error } = await supabase
    .from('clinic_settings')
    .upsert({
      id:              'default',
      active_weekdays: settings.active_weekdays,
      start_hour:      settings.start_hour,
      end_hour:        settings.end_hour,
      slot_interval:   settings.slot_interval,
      blocked_dates:   settings.blocked_dates,
      updated_at:      new Date().toISOString(),
    })
  if (!error) invalidateSettingsCache()
  return !error
}
