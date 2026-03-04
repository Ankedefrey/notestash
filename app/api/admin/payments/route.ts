import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateAccessCode } from '@/lib/utils'

async function requireAdmin(supabase: any, admin: any, user: any) {
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

// GET — list all payments with totals
export async function GET() {
  const supabase = createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(supabase, admin, user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: payments } = await admin
    .from('payments')
    .select('*, modules(code, name), access_codes(code)')
    .order('created_at', { ascending: false })

  // Revenue stats
  const total = payments?.reduce((s: number, p: any) => s + p.amount_zar, 0) ?? 0
  const now = new Date()
  const thisMonth = payments?.filter((p: any) => {
    const d = new Date(p.date_paid)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s: number, p: any) => s + p.amount_zar, 0) ?? 0

  return NextResponse.json({ payments, stats: { total, thisMonth, count: payments?.length ?? 0 } })
}

// POST — log a new EFT payment and generate a code
export async function POST(request: Request) {
  const supabase = createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(supabase, admin, user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { payer_name, reference, module_id, amount_zar, date_paid, notes } = await request.json()

  if (!payer_name || !reference || !module_id || !amount_zar || !date_paid) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Generate access code
  let code = generateAccessCode()
  const { data: newCode } = await admin.from('access_codes').insert({
    code,
    module_id,
    created_by: user.id,
  }).select().single()

  // Log payment
  const { data: payment, error } = await admin.from('payments').insert({
    payer_name,
    reference,
    module_id,
    amount_zar: Number(amount_zar),
    date_paid,
    notes,
    code_id: newCode?.id,
    logged_by: user.id,
  }).select('*, modules(code, name), access_codes(code)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ payment, code })
}
