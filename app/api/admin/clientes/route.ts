import { NextResponse } from 'next/server'
import { createStaffServerClient, createServiceClient } from '@/lib/supabase/server'

/** PATCH /api/admin/clientes  — update a cliente record */
export async function PATCH(request: Request) {
  // Verify admin
  let staffClient: Awaited<ReturnType<typeof createStaffServerClient>>
  try {
    staffClient = await createStaffServerClient()
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }

  const { data: { user: authUser } } = await staffClient.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const { data: callerProfile } = await staffClient
    .from('profiles').select('role').eq('id', authUser.id).single()
  if (!callerProfile || !['admin', 'funcionario'].includes(callerProfile.role)) {
    return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 })
  }

  let body: { id: string; updates: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }

  if (!body.id || !body.updates) {
    return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 })
  }

  let service: ReturnType<typeof createServiceClient>
  try {
    service = createServiceClient()
  } catch {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.' },
      { status: 500 }
    )
  }

  const { error } = await service
    .from('clientes')
    .update({ ...body.updates, updated_at: new Date().toISOString() })
    .eq('id', body.id)

  if (error) {
    console.error('[api] update cliente:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
