import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET all modules
export async function GET() {
  const supabase = createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data } = await admin
    .from('modules')
    .select('*, pdfs(id, title, page_count, sort_order, active, uploaded_at)')
    .order('code')

  return NextResponse.json(data)
}

// POST — create new module
export async function POST(request: Request) {
  const supabase = createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { code, name, description, price_zar } = await request.json()
  if (!code || !name) return NextResponse.json({ error: 'code and name required' }, { status: 400 })

  const { data, error } = await admin.from('modules').insert({
    code: code.toUpperCase(),
    name,
    description,
    price_zar: price_zar ?? 149,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
