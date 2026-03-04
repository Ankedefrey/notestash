'use client'
import { useEffect, useState } from 'react'

interface Payment {
  id: string
  payer_name: string
  reference: string
  amount_zar: number
  date_paid: string
  notes?: string
  modules?: { code: string; name: string }
  access_codes?: { code: string }
  code?: string
}

interface Module { id: string; code: string; name: string }

const EMPTY = { payer_name: '', reference: '', module_id: '', amount_zar: 149, date_paid: new Date().toISOString().split('T')[0], notes: '' }

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [stats, setStats] = useState<any>({})
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [newCode, setNewCode] = useState('')

  useEffect(() => {
    fetch('/api/admin/payments').then(r => r.json()).then(d => {
      setPayments(d.payments ?? [])
      setStats(d.stats ?? {})
    })
    fetch('/api/admin/modules').then(r => r.json()).then(d => setModules(d ?? []))
  }, [])

  const submit = async () => {
    if (!form.payer_name || !form.reference || !form.module_id) return
    setLoading(true)
    const res = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setPayments(prev => [data.payment, ...prev])
      setNewCode(data.code)
      setStats((s: any) => ({ ...s, total: (s.total ?? 0) + Number(form.amount_zar), count: (s.count ?? 0) + 1 }))
      setForm(EMPTY)
      setShowForm(false)
    }
  }

  const exportCsv = () => {
    const rows = [['Payer','Reference','Module','Amount','Date','Code'],...payments.map(p => [p.payer_name, p.reference, p.modules?.code ?? '', p.amount_zar, p.date_paid, p.access_codes?.code ?? ''])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = `notestash-payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-syne font-extrabold text-3xl mb-1">EFT Payments</h1>
          <p className="text-[var(--muted)]">Log manual bank transfers and issue access codes.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCsv} className="border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-xl px-4 py-2.5 text-sm font-syne font-semibold transition-all">⬇ Export CSV</button>
          <button onClick={() => setShowForm(true)} className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl px-5 py-2.5 text-sm hover:-translate-y-0.5 transition-transform">+ Log payment</button>
        </div>
      </div>

      {/* New code banner */}
      {newCode && (
        <div className="mb-6 p-5 bg-[var(--green)]/10 border border-[var(--green)]/30 rounded-2xl flex items-center justify-between">
          <div>
            <div className="font-syne font-bold text-[var(--green)] mb-1">✅ Payment logged! Access code generated:</div>
            <div className="font-mono text-2xl font-bold tracking-widest">{newCode}</div>
            <div className="text-[var(--muted)] text-xs mt-1">Send this code to the student via WhatsApp or email.</div>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(newCode); }} className="border border-[var(--green)]/40 text-[var(--green)] rounded-xl px-4 py-2 text-sm font-syne font-semibold">Copy code</button>
        </div>
      )}

      {/* Add payment form */}
      {showForm && (
        <div className="mb-6 bg-[var(--card)] border border-[var(--accent)]/30 rounded-2xl p-6">
          <div className="font-syne font-bold text-lg mb-5">📝 Log new EFT payment</div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {([
              { label: 'Payer full name', key: 'payer_name', placeholder: 'As shown in your banking app' },
              { label: 'Payment reference', key: 'reference', placeholder: 'e.g. JohnSmith STK110' },
              { label: 'Amount (Rands)', key: 'amount_zar', placeholder: '149', type: 'number' },
              { label: 'Date paid', key: 'date_paid', type: 'date' },
            ] as any[]).map(f => (
              <div key={f.key}>
                <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">{f.label}</label>
                <input type={f.type || 'text'} placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
              </div>
            ))}
            <div>
              <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">Module purchased</label>
              <select value={form.module_id} onChange={e => setForm(prev => ({ ...prev, module_id: e.target.value }))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors">
                <option value="">Select module…</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">Notes (optional)</label>
              <input placeholder="e.g. Confirmed via WhatsApp" value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={submit} disabled={loading}
              className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl px-6 py-2.5 text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-50">
              {loading ? 'Saving…' : '✅ Log & generate access code'}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-xl px-5 py-2.5 text-sm font-syne font-semibold transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Payments table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--card-hover)]">
              {['Payer','Reference','Module','Amount','Date','Code issued'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-[var(--muted)] font-syne font-bold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={i} className="border-t border-[var(--border)]">
                <td className="px-5 py-3 font-medium">{p.payer_name}</td>
                <td className="px-5 py-3 text-[var(--muted)] text-xs font-mono">{p.reference}</td>
                <td className="px-5 py-3">
                  {p.modules && <span className="bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-syne font-bold px-2 py-0.5 rounded">{p.modules.code}</span>}
                </td>
                <td className="px-5 py-3 text-[var(--green)] font-bold">R{p.amount_zar}</td>
                <td className="px-5 py-3 text-[var(--muted)]">{p.date_paid}</td>
                <td className="px-5 py-3 font-mono text-xs text-[var(--accent)]">{p.access_codes?.code ?? '—'}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-[var(--muted)]">No payments logged yet. Log your first one! 💸</td></tr>
            )}
          </tbody>
        </table>
        {payments.length > 0 && (
          <div className="px-5 py-3 border-t border-[var(--border)] flex justify-between items-center">
            <span className="text-sm text-[var(--muted)]">{payments.length} payment{payments.length !== 1 ? 's' : ''}</span>
            <span className="font-syne font-bold text-[var(--green)]">Total: R{stats.total?.toLocaleString('en-ZA') ?? 0}</span>
          </div>
        )}
      </div>
    </div>
  )
}
