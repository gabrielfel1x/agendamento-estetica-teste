import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const STAFF_COOKIE_NAME = 'sb-staff-auth'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  // Acumula cookies de ambas as sessões para não perder nenhuma ao recriar response
  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = []

  function makeServerClient(cookieOpts?: { name: string }) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        ...(cookieOpts ? { cookieOptions: cookieOpts } : {}),
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            pendingCookies.push(
              ...cookiesToSet.map(c => ({ name: c.name, value: c.value, options: (c.options ?? {}) as Record<string, unknown> }))
            )
          },
        },
      }
    )
  }

  // Cria duas instâncias — cada uma lê/escreve cookies com prefixo diferente
  const clientSupabase = makeServerClient()
  const staffSupabase  = makeServerClient({ name: STAFF_COOKIE_NAME })

  // Refresca ambas as sessões em paralelo (evita expiração de token)
  const [{ data: { user: clientUser } }, { data: { user: staffUser } }] = await Promise.all([
    clientSupabase.auth.getUser(),
    staffSupabase.auth.getUser(),
  ])

  // Monta response final com todos os cookies atualizados
  supabaseResponse = NextResponse.next({ request })
  for (const { name, value, options } of pendingCookies) {
    supabaseResponse.cookies.set(name, value, options)
  }

  const { pathname } = request.nextUrl

  // ── Rotas protegidas do ADMIN/STAFF ───────────────────────────────
  const staffPaths = ['/agenda', '/clientes', '/dashboard', '/receita', '/configuracoes']
  const isStaffRoute = staffPaths.some(p => pathname.startsWith(p))

  if (isStaffRoute && !staffUser) {
    return NextResponse.redirect(new URL('/acesso', request.url))
  }

  // ── Rotas protegidas do CLIENTE ───────────────────────────────────
  const clientPaths = ['/minha-conta', '/assinatura']
  const isClientRoute = clientPaths.some(p => pathname.startsWith(p))

  if (isClientRoute && !clientUser) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── /acesso → já logado como staff? redireciona ──────────────────
  if (pathname === '/acesso' && staffUser) {
    return NextResponse.redirect(new URL('/agenda', request.url))
  }

  // ── /login → já logado como cliente? redireciona ─────────────────
  if (pathname === '/login' && clientUser) {
    return NextResponse.redirect(new URL('/minha-conta', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
