import { createClient } from '@/lib/supabase/server'

export default async function AdminActivityPage() {
  const supabase = createClient()
  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, profiles(email)')
    .order('last_seen', { ascending: false })
    .limit(50)

  const eventIcon = (e: string) => {
    if (e.includes('kick') || e.includes('revok')) return '⚠️'
    if (e.includes('redeem')) return '🔑'
    if (e.includes('login')) return '👤'
    return '📝'
  }

  return (
    <div>
      <h1 className="font-syne font-extrabold text-3xl mb-1">Activity Logs</h1>
      <p className="text-[var(--muted)] mb-8">Track suspicious logins, code redemptions, and session events.</p>

      {/* Active sessions */}
      <div className="mb-8">
        <div className="font-syne font-bold text-lg mb-4">Active Sessions</div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--card-hover)]">
                {['User','Device','Last seen','IP hash','Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-[var(--muted)] font-syne font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(sessions ?? []).map((s: any, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="px-5 py-3 text-xs">{s.profiles?.email ?? '—'}</td>
                  <td className="px-5 py-3 text-[var(--muted)] text-xs">{s.device_info ?? '—'}</td>
                  <td className="px-5 py-3 text-[var(--muted)] text-xs">{new Date(s.last_seen).toLocaleString('en-ZA')}</td>
                  <td className="px-5 py-3 font-mono text-xs text-[var(--muted)]">{s.ip_hash?.slice(0, 12) ?? '—'}…</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-syne font-bold px-2 py-0.5 rounded ${s.is_active ? 'bg-[var(--green)]/15 text-[var(--green)]' : 'bg-[var(--muted)]/15 text-[var(--muted)]'}`}>
                      {s.is_active ? 'Active' : 'Ended'}
                    </span>
                  </td>
                </tr>
              ))}
              {(sessions?.length ?? 0) === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">No sessions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event log */}
      <div>
        <div className="font-syne font-bold text-lg mb-4">Event Log</div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--card-hover)]">
                {['Event','Details','IP','When'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-[var(--muted)] font-syne font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((log: any, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <span>{eventIcon(log.event)}</span>
                      <span className="font-mono text-xs">{log.event}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-[var(--muted)] max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-[var(--muted)]">{log.ip_hash?.slice(0, 12) ?? '—'}…</td>
                  <td className="px-5 py-3 text-xs text-[var(--muted)]">{new Date(log.created_at).toLocaleString('en-ZA')}</td>
                </tr>
              ))}
              {(logs?.length ?? 0) === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-[var(--muted)]">No activity logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
