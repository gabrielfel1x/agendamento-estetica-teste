import { NextResponse } from 'next/server'
import { createStaffServerClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // 1. Verify requester is an authenticated admin
  let staffClient: Awaited<ReturnType<typeof createStaffServerClient>>
  try {
    staffClient = await createStaffServerClient()
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }

  const { data: { user: authUser } } = await staffClient.auth.getUser()
  if (!authUser) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { data: callerProfile } = await staffClient
    .from('profiles')
    .select('role')
    .eq('id', authUser.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 })
  }

  // 2. Parse body
  let email: string, password: string, name: string, phone: string | null, role: string
  try {
    const body = await request.json()
    email    = body.email
    password = body.password
    name     = body.name
    phone    = body.phone ?? null
    role     = body.role
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 })
  }

  if (!['admin', 'funcionario'].includes(role)) {
    return NextResponse.json({ error: 'Função inválida.' }, { status: 400 })
  }

  // 3. Use service role client — creates user without sending confirmation email
  let service: ReturnType<typeof createServiceClient>
  try {
    service = createServiceClient()
  } catch {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.' },
      { status: 500 }
    )
  }

  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // activate immediately, no confirmation email
    user_metadata: { name },
  })

  if (authError) {
    console.error('[api] create-user auth:', authError.message)
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const userId = authData.user.id

  // 4. Upsert profile row
  const { error: profileError } = await service
    .from('profiles')
    .upsert({
      id:         userId,
      name,
      phone:      phone || null,
      role,
      updated_at: new Date().toISOString(),
    })

  if (profileError) {
    console.error('[api] create-user profile:', profileError.message)
    // Clean up orphan auth user
    await service.auth.admin.deleteUser(userId)
    return NextResponse.json(
      { error: 'Erro ao salvar perfil: ' + profileError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    profile: { id: userId, name, phone, role },
  })
}
