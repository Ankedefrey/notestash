import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await request.json()
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 })

  // Look up the code
  const { data: accessCode, error } = await admin
    .from('access_codes')
    .select('*, modules(*)')
    .eq('code', code.trim().toUpperCase())
    .single()

  if (error || !accessCode) {
    return NextResponse.json({ error: 'Invalid code. Double-check and try again 😬' }, { status: 404 })
  }

  if (accessCode.status !== 'active') {
    return NextResponse.json({
      error: accessCode.status === 'redeemed'
        ? 'This code has already been used. Each code is single-use only.'
        : 'This code has expired or been revoked.'
    }, { status: 400 })
  }

  if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
    await admin.from('access_codes').update({ status: 'expired' }).eq('id', accessCode.id)
    return NextResponse.json({ error: 'This code has expired 😔' }, { status: 400 })
  }

  // Check if user already has this module
  const { data: existing } = await admin
    .from('entitlements')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', accessCode.module_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'You already have access to this module!' }, { status: 400 })
  }

  // Grant entitlement
  const expiresAt = accessCode.expires_at
    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    : null

  await admin.from('entitlements').insert({
    user_id: user.id,
    module_id: accessCode.module_id,
    expires_at: expiresAt,
  })

  // Mark code as redeemed
  await admin.from('access_codes').update({
    status: accessCode.max_uses <= 1 ? 'redeemed' : 'active',
    use_count: accessCode.use_count + 1,
    redeemed_by: user.id,
    redeemed_at: new Date().toISOString(),
  }).eq('id', accessCode.id)

  // Log activity
  await admin.from('activity_logs').insert({
    user_id: user.id,
    event: 'code_redeemed',
    metadata: { code, module_id: accessCode.module_id, module_code: accessCode.modules?.code },
  })

  return NextResponse.json({
    success: true,
    module: accessCode.modules,
    message: `🎉 ${accessCode.modules?.code} unlocked! Time to study, bestie.`
  })
}
