import { createBrowserClient } from '@supabase/ssr'

/** Cliente Supabase padrão — sessão de CLIENTE (cookie padrão) */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/** Nome do cookie usado pela sessão de staff/admin */
export const STAFF_COOKIE_NAME = 'sb-staff-auth'

/** Cliente Supabase com cookie separado — sessão de ADMIN/STAFF */
export function createStaffClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      isSingleton: false,
      cookieOptions: { name: STAFF_COOKIE_NAME },
    }
  )
}
