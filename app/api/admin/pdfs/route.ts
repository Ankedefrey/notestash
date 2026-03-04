import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST — register a PDF that was uploaded to Supabase Storage
export async function POST(request: Request) {
  const supabase = createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { module_id, title, storage_path, file_size, page_count, sort_order } = await request.json()
  if (!module_id || !title || !storage_path) {
    return NextResponse.json({ error: 'module_id, title, storage_path required' }, { status: 400 })
  }

  const { data, error } = await admin.from('pdfs').insert({
    module_id,
    title,
    storage_path,
    file_size,
    page_count,
    sort_order: sort_order ?? 0,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
