import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usa service role para ignorar RLS — settings é dado público/não-sensível
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

const DEFAULT_SETTINGS = {
  active_weekdays: [1, 2, 3, 4, 5, 6],
  start_hour:      '08:00',
  end_hour:        '18:00',
  slot_interval:   30,
  blocked_dates:   [] as string[],
}

export async function GET() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .eq('id', 'default')
      .single()

    if (error || !data) {
      return NextResponse.json(DEFAULT_SETTINGS)
    }

    return NextResponse.json({
      active_weekdays: data.active_weekdays ?? DEFAULT_SETTINGS.active_weekdays,
      start_hour:      data.start_hour      ?? DEFAULT_SETTINGS.start_hour,
      end_hour:        data.end_hour        ?? DEFAULT_SETTINGS.end_hour,
      slot_interval:   data.slot_interval   ?? DEFAULT_SETTINGS.slot_interval,
      blocked_dates:   (data.blocked_dates ?? []).map((d: string) => String(d).slice(0, 10)),
    })
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}
