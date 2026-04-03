import { NextResponse } from 'next/server'
import { createStaffServerClient, createServiceClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
  // 1. Verify the requester is an authenticated admin
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
  let id: string, type: string
  try {
    const body = await request.json()
    id   = body.id
    type = body.type // 'staff' | 'cliente'
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }

  if (!id || !type) {
    return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 })
  }

  // 3. Use service role client to bypass RLS
  let service: ReturnType<typeof createServiceClient>
  try {
    service = createServiceClient()
  } catch {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.' },
      { status: 500 }
    )
  }

  if (type === 'cliente') {
    const { error } = await service.from('clientes').delete().eq('id', id)
    if (error) {
      console.error('[api] delete cliente:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  if (type === 'staff') {
    // Prevent self-deletion
    if (id === authUser.id) {
      return NextResponse.json({ error: 'Não é possível excluir sua própria conta.' }, { status: 400 })
    }
    // Delete profile row first (FK constraint)
    const { error: profileErr } = await service.from('profiles').delete().eq('id', id)
    if (profileErr) {
      console.error('[api] delete staff profile:', profileErr.message)
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }
    // Delete auth user
    const { error: authErr } = await service.auth.admin.deleteUser(id)
    if (authErr) {
      console.error('[api] delete staff auth user:', authErr.message)
      // Profile was already deleted — auth user orphan is acceptable but log it
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 })
}
