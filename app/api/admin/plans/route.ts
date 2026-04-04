import { NextResponse } from 'next/server'
import { createStaffServerClient, createServiceClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const staffClient = await createStaffServerClient()
  const { data: { user } } = await staffClient.auth.getUser()
  if (!user) return { error: 'Não autorizado.', status: 401 }

  const { data: profile } = await staffClient
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    return { error: 'Acesso restrito a administradores.', status: 403 }
  }
  return { error: null, status: 200 }
}

function toSlug(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function fmtPrice(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** POST — criar plano + features */
export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { name: string; priceNum: number; description: string; popular: boolean; features: string[]; sortOrder?: number }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }

  if (!body.name?.trim() || !body.priceNum || !body.features?.length) {
    return NextResponse.json({ error: 'Nome, preço e benefícios são obrigatórios.' }, { status: 400 })
  }

  const service = createServiceClient()

  // Se o novo plano é popular, remove o destaque dos outros
  if (body.popular) {
    await service.from('plans').update({ popular: false }).neq('id', 'none')
  }

  const slug = toSlug(body.name)
  const { data: plan, error: planError } = await service
    .from('plans')
    .insert({
      slug,
      name:        body.name.trim(),
      price:       fmtPrice(body.priceNum),
      price_num:   body.priceNum,
      description: body.description?.trim() ?? '',
      popular:     body.popular,
      active:      true,
      sort_order:  body.sortOrder ?? 0,
    })
    .select()
    .single()

  if (planError) {
    console.error('[api] create plan:', planError.message)
    return NextResponse.json({ error: planError.message }, { status: 500 })
  }

  const featureRows = body.features
    .filter(f => f.trim())
    .map((f, i) => ({ plan_id: plan.id, description: f.trim(), sort_order: i }))

  if (featureRows.length) {
    const { error: featError } = await service.from('plan_features').insert(featureRows)
    if (featError) {
      console.error('[api] create plan features:', featError.message)
      // Rollback plan
      await service.from('plans').delete().eq('id', plan.id)
      return NextResponse.json({ error: 'Erro ao salvar benefícios.' }, { status: 500 })
    }
  }

  return NextResponse.json({
    ok: true,
    plan: {
      id:          plan.id,
      slug:        plan.slug,
      name:        plan.name,
      price:       plan.price,
      priceNum:    plan.price_num,
      description: plan.description,
      popular:     plan.popular,
      active:      plan.active,
      sortOrder:   plan.sort_order,
      features:    body.features.filter(f => f.trim()),
    },
  })
}

/** PATCH — atualizar plano + substituir features */
export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { id: string; name?: string; priceNum?: number; description?: string; popular?: boolean; active?: boolean; features?: string[] }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }
  if (!body.id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })

  const service = createServiceClient()

  // Se está marcando como popular, remove dos outros
  if (body.popular === true) {
    await service.from('plans').update({ popular: false }).neq('id', body.id)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = { updated_at: new Date().toISOString() }
  if (body.name        !== undefined) { updates.name = body.name.trim(); updates.slug = toSlug(body.name) }
  if (body.priceNum    !== undefined) { updates.price_num = body.priceNum; updates.price = fmtPrice(body.priceNum) }
  if (body.description !== undefined) { updates.description = body.description.trim() }
  if (body.popular     !== undefined) { updates.popular = body.popular }
  if (body.active      !== undefined) { updates.active = body.active }

  const { error: planError } = await service.from('plans').update(updates).eq('id', body.id)
  if (planError) {
    console.error('[api] update plan:', planError.message)
    return NextResponse.json({ error: planError.message }, { status: 500 })
  }

  // Substituir features se fornecidas
  if (body.features !== undefined) {
    await service.from('plan_features').delete().eq('plan_id', body.id)
    const featureRows = body.features
      .filter(f => f.trim())
      .map((f, i) => ({ plan_id: body.id, description: f.trim(), sort_order: i }))
    if (featureRows.length) {
      const { error: featError } = await service.from('plan_features').insert(featureRows)
      if (featError) {
        console.error('[api] update plan features:', featError.message)
        return NextResponse.json({ error: 'Erro ao salvar benefícios.' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ ok: true })
}

/** DELETE — excluir plano (e features por FK) */
export async function DELETE(request: Request) {
  const auth = await requireAdmin()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { id: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }
  if (!body.id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })

  const service = createServiceClient()

  // Deletar features primeiro (sem CASCADE no FK)
  await service.from('plan_features').delete().eq('plan_id', body.id)

  const { error } = await service.from('plans').delete().eq('id', body.id)
  if (error) {
    console.error('[api] delete plan:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
