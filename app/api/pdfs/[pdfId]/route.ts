import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { pdfId: string } }
) {
  const supabase = createClient()
  const admin = createAdminClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Get PDF metadata
  const { data: pdf } = await admin
    .from('pdfs')
    .select('*, modules(*)')
    .eq('id', params.pdfId)
    .eq('active', true)
    .single()

  if (!pdf) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 3. Check profile role (admins bypass entitlement check)
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    // 4. Check entitlement
    const { data: entitlement } = await admin
      .from('entitlements')
      .select('id, expires_at')
      .eq('user_id', user.id)
      .eq('module_id', pdf.module_id)
      .single()

    if (!entitlement) {
      return NextResponse.json({ error: 'You do not have access to this module.' }, { status: 403 })
    }

    if (entitlement.expires_at && new Date(entitlement.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Your access to this module has expired.' }, { status: 403 })
    }
  }

  // 5. Generate short-lived signed URL (60 seconds — only enough to start download)
  const { data: signedUrl, error } = await admin.storage
    .from('pdfs')
    .createSignedUrl(pdf.storage_path, 60)

  if (error || !signedUrl) {
    return NextResponse.json({ error: 'Could not generate PDF URL' }, { status: 500 })
  }

  // Return the signed URL — client uses this to load into PDF.js
  // The short expiry means sharing the URL is useless after 60s
  return NextResponse.json({
    url: signedUrl.signedUrl,
    title: pdf.title,
    pageCount: pdf.page_count,
    userEmail: user.email,
  })
}
