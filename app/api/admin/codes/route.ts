import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateAccessCode } from '@/lib/utils'

// GET — list all codes
export async function GET() {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data } = await admin
    .from('access_codes')
    .select('*, modules(code, name), profiles(email)')
    .order('created_at', { ascending: false })

  return NextResponse.json(data)
}

// POST — generate a new code
export async function POST(request: Request) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { module_id, expires_at, max_uses = 1 } = body

  if (!module_id) return NextResponse.json({ error: 'module_id required' }, { status: 400 })

  // Generate unique code (retry if collision)
  let code = generateAccessCode()
  let attempts = 0
  while (attempts < 5) {
    const { data: existing } = await admin.from('access_codes').select('id').eq('code', code).single()
    if (!existing) break
    code = generateAccessCode()
    attempts++
  }

  const { data, error } = await admin.from('access_codes').insert({
    code,
    module_id,
    expires_at: expires_at || null,
    max_uses,
    created_by: user.id,
  }).select('*, modules(code, name)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
