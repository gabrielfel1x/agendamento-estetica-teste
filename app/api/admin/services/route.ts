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

function fmtPrice(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** POST — criar serviço */
export async function POST(request: Request) {
  const auth = await getAuthenticatedStaff()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { name: string; priceNum: number; sortOrder?: number; categoryId?: string | null }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }

  if (!body.name?.trim() || !body.priceNum) {
    return NextResponse.json({ error: 'Nome e preço são obrigatórios.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('procedures_catalog')
    .insert({
      name:        body.name.trim(),
      price:       fmtPrice(body.priceNum),
      price_num:   body.priceNum,
      active:      true,
      sort_order:  body.sortOrder ?? 0,
      category_id: body.categoryId ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[api] create service:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    servico: {
      id:           data.id,
      name:         data.name,
      price:        data.price,
      priceNum:     data.price_num,
      active:       data.active,
      sortOrder:    data.sort_order,
      categoryId:   data.category_id   ?? null,
      categoryName: null,
    },
  })
}

/** PATCH — atualizar serviço */
export async function PATCH(request: Request) {
  const auth = await getAuthenticatedStaff()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { id: string; name?: string; priceNum?: number; active?: boolean; categoryId?: string | null }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }
  if (!body.id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = { updated_at: new Date().toISOString() }
  if (body.name       !== undefined) { updates.name = body.name.trim() }
  if (body.priceNum   !== undefined) { updates.price_num = body.priceNum; updates.price = fmtPrice(body.priceNum) }
  if (body.active     !== undefined) { updates.active = body.active }
  if ('categoryId' in body)          { updates.category_id = body.categoryId ?? null }

  const service = createServiceClient()
  const { error } = await service
    .from('procedures_catalog')
    .update(updates)
    .eq('id', body.id)

  if (error) {
    console.error('[api] update service:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

/** DELETE — excluir serviço */
export async function DELETE(request: Request) {
  const auth = await getAuthenticatedStaff()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { id: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }
  if (!body.id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service
    .from('procedures_catalog')
    .delete()
    .eq('id', body.id)

  if (error) {
    console.error('[api] delete service:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
