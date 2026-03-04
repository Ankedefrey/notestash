import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RedeemCode from '@/components/RedeemCode'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin')

  // Get entitlements with module + PDF data
  const { data: entitlements } = await supabase
    .from('entitlements')
    .select('*, modules(*, pdfs(id, title, page_count, sort_order, active))')
    .eq('user_id', user.id)
    .order('granted_at', { ascending: false })

  // Get all active modules (to show locked ones)
  const { data: allModules } = await supabase.from('modules').select('*').eq('active', true)
  const ownedIds = new Set(entitlements?.map(e => e.module_id) ?? [])
  const lockedModules = allModules?.filter(m => !ownedIds.has(m.id)) ?? []

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center font-syne font-black text-black text-sm">N</div>
            <span className="font-syne font-extrabold text-lg tracking-tight">NoteStash</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--muted)] hidden sm:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="font-syne font-extrabold text-4xl animate-fade-up">Your notes 📚</h1>
          <p className="text-[var(--muted)] mt-2 animate-fade-up-2">You've got this. One formula at a time.</p>
        </div>

        {/* Owned modules */}
        {(entitlements?.length ?? 0) > 0 && (
          <div className="mb-12">
            <div className="font-syne text-xs font-bold text-[var(--muted)] tracking-widest uppercase mb-4">✅ Your modules</div>
            <div className="flex flex-col gap-4">
              {entitlements!.map(e => {
                const mod = e.modules as any
                const pdfs = (mod?.pdfs ?? []).filter((p: any) => p.active).sort((a: any, b: any) => a.sort_order - b.sort_order)
                return (
                  <div key={e.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="bg-[var(--accent)]/15 text-[var(--accent)] text-sm font-syne font-bold px-2.5 py-1 rounded-lg">{mod?.code}</span>
                        <div>
                          <div className="font-syne font-bold">{mod?.name}</div>
                          <div className="text-[var(--muted)] text-xs mt-0.5">{pdfs.length} PDFs</div>
                        </div>
                      </div>
                      <span className="bg-[var(--green)]/15 text-[var(--green)] text-xs font-syne font-bold px-2.5 py-1 rounded-lg">Active</span>
                    </div>
                    <div className="border-t border-[var(--border)]">
                      {pdfs.map((pdf: any, i: number) => (
                        <Link key={pdf.id} href={`/dashboard/view/${pdf.id}`}
                          className={`flex items-center justify-between px-6 py-3.5 hover:bg-[var(--card-hover)] transition-colors ${i < pdfs.length-1 ? 'border-b border-[var(--border)]' : ''}`}>
                          <div className="flex items-center gap-3">
                            <span>📄</span>
                            <div>
                              <div className="text-sm">{pdf.title}</div>
                              {pdf.page_count && <div className="text-[var(--muted)] text-xs">{pdf.page_count} pages</div>}
                            </div>
                          </div>
                          <span className="text-[var(--accent)]">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Redeem code */}
        <RedeemCode />

        {/* Locked modules */}
        {lockedModules.length > 0 && (
          <div className="mt-12">
            <div className="font-syne text-xs font-bold text-[var(--muted)] tracking-widest uppercase mb-4">🔒 Available (not purchased)</div>
            <div className="flex flex-col gap-3">
              {lockedModules.map(m => (
                <div key={m.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl px-6 py-4 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-4">
                    <span className="bg-[var(--border)] text-[var(--muted)] text-sm font-syne font-bold px-2.5 py-1 rounded-lg">{m.code}</span>
                    <div className="font-syne font-bold text-sm">{m.name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-syne font-extrabold text-[var(--accent)]">R{m.price_zar}</span>
                    <span className="text-[var(--muted)] text-xs">Buy via EFT →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(entitlements?.length ?? 0) === 0 && (
          <div className="text-center py-16 text-[var(--muted)]">
            <div className="text-5xl mb-4">📭</div>
            <div className="font-syne font-bold text-lg mb-2">No modules yet</div>
            <div className="text-sm">Buy access via EFT and redeem your code below to get started.</div>
          </div>
        )}
      </div>
    </div>
  )
}
