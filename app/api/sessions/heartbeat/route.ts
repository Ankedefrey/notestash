import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { hashString } from '@/lib/utils'

export async function POST(request: Request) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ valid: false })

  const { sessionToken } = await request.json()
  if (!sessionToken) return NextResponse.json({ valid: false })

  const tokenHash = await hashString(sessionToken)

  // Find this session
  const { data: session } = await admin
    .from('sessions')
    .select('id, revoked_at')
    .eq('token_hash', tokenHash)
    .eq('user_id', user.id)
    .single()

  if (!session || session.revoked_at) {
    // Session was revoked (another device logged in) — tell client to log out
    return NextResponse.json({ valid: false, reason: 'session_revoked' })
  }

  // Update last_seen
  await admin
    .from('sessions')
    .update({ last_seen: new Date().toISOString() })
    .eq('id', session.id)

  return NextResponse.json({ valid: true })
}
