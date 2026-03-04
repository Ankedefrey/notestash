import { createClient } from '@/lib/supabase/server'

export default async function AdminOverview() {
  const supabase = createClient()

  const [{ data: payments }, { data: codes }, { data: users }] = await Promise.all([
    supabase.from('payments').select('amount_zar, date_paid').order('date_paid', { ascending: false }),
    supabase.from('access_codes').select('status'),
    supabase.from('profiles').select('id, email, created_at').eq('role', 'student').order('created_at', { ascending: false }).limit(10),
  ])

  const totalRevenue = payments?.reduce((s, p) => s + p.amount_zar, 0) ?? 0
  const now = new Date()
  const thisMonth = payments?.filter(p => {
    const d = new Date(p.date_paid)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s, p) => s + p.amount_zar, 0) ?? 0
  const activeCodes = codes?.filter(c => c.status === 'active').length ?? 0

  const stats = [
    { label: 'Total Revenue', value: `R${totalRevenue.toLocaleString('en-ZA')}`, sub: 'All time', color: 'var(--accent)' },
    { label: 'This Month', value: `R${thisMonth.toLocaleString('en-ZA')}`, sub: new Date().toLocaleString('en-ZA', { month: 'long', year: 'numeric' }), color: 'var(--green)' },
    { label: 'Total Sales', value: String(payments?.length ?? 0), sub: 'EFT payments logged', color: 'var(--blue)' },
    { label: 'Active Codes', value: String(activeCodes), sub: 'Unredeemed codes', color: 'var(--red)' },
  ]

  return (
    <div>
      <h1 className="font-syne font-extrabold text-3xl mb-1">Overview</h1>
      <p className="text-[var(--muted)] mb-8">Here's how the business is doing 💅</p>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
            <div className="text-xs text-[var(--muted)] font-syne font-bold uppercase tracking-widest mb-2">{s.label}</div>
            <div className="font-syne font-extrabold text-3xl mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[var(--muted)]">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent payments */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <div className="font-syne font-bold">Recent payments</div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--card-hover)]">
              {['Date','Amount','Module'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-[var(--muted)] font-syne font-bold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).slice(0, 8).map((p, i) => (
              <tr key={i} className="border-t border-[var(--border)]">
                <td className="px-5 py-3 text-[var(--muted)]">{p.date_paid}</td>
                <td className="px-5 py-3 text-[var(--green)] font-bold">R{p.amount_zar}</td>
                <td className="px-5 py-3">—</td>
              </tr>
            ))}
            {(payments?.length ?? 0) === 0 && (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-[var(--muted)] text-sm">No payments yet. Go make some sales! 🚀</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
