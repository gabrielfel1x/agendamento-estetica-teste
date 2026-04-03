import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ booked: [] })
  }

  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('appointments')
      .select('time, status')
      .eq('date', date)
      .neq('status', 'cancelado')

    if (error || !data) return NextResponse.json({ booked: [] })

    const booked = data.map((row: { time: string }) =>
      String(row.time).substring(0, 5)
    )
    return NextResponse.json({ booked })
  } catch {
    return NextResponse.json({ booked: [] })
  }
}
