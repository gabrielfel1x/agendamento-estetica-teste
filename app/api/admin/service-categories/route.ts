import { NextResponse } from 'next/server'
import { createStaffServerClient, createServiceClient } from '@/lib/supabase/server'

async function getAuthenticatedStaff() {
  const staffClient = await createStaffServerClient()
  const { data: { user } } = await staffClient.auth.getUser()
  if (!user) return { error: 'Não autorizado.', status: 401, user: null, role: null }

  const { data: profile } = await staffClient
    .from('profiles').select('role').eq('id', user.id).single()

  if (!profile || !['admin', 'funcionario'].includes(profile.role)) {
    return { error: 'Acesso restrito.', status: 403, user: null, role: null }
  }
  return { error: null, status: 200, user, role: profile.role as string }
}

/** POST — criar categoria */
export async function POST(request: Request) {
  const auth = await getAuthenticatedStaff()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { name: string; sortOrder?: number }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('service_categories')
    .insert({ name: body.name.trim(), sort_order: body.sortOrder ?? 0 })
    .select()
    .single()

  if (error) {
    console.error('[api] create category:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    category: { id: data.id, name: data.name, active: data.active, sortOrder: data.sort_order },
  })
}

/** PATCH — atualizar categoria */
export async function PATCH(request: Request) {
  const auth = await getAuthenticatedStaff()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { id: string; name?: string; active?: boolean }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }
  if (!body.id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = { updated_at: new Date().toISOString() }
  if (body.name   !== undefined) updates.name   = body.name.trim()
  if (body.active !== undefined) updates.active = body.active

  const service = createServiceClient()
  const { error } = await service.from('service_categories').update(updates).eq('id', body.id)

  if (error) {
    console.error('[api] update category:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

/** DELETE — excluir categoria */
export async function DELETE(request: Request) {
  const auth = await getAuthenticatedStaff()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { id: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }
  if (!body.id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })

  // Desvincula os serviços da categoria antes de excluir
  const service = createServiceClient()
  await service.from('procedures_catalog').update({ category_id: null }).eq('category_id', body.id)

  const { error } = await service.from('service_categories').delete().eq('id', body.id)

  if (error) {
    console.error('[api] delete category:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
