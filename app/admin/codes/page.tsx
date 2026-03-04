'use client'
import { useEffect, useState } from 'react'

interface Code {
  id: string
  code: string
  status: string
  created_at: string
  expires_at?: string
  modules?: { code: string; name: string }
  profiles?: { email: string }
}

interface Module { id: string; code: string; name: string }

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<Code[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModule, setSelectedModule] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetch('/api/admin/codes').then(r => r.json()).then(setCodes)
    fetch('/api/admin/modules').then(r => r.json()).then(d => {
      setModules(d ?? [])
      if (d?.[0]) setSelectedModule(d[0].id)
    })
  }, [])

  const generateCode = async () => {
    if (!selectedModule) return
    setGenerating(true)
    const res = await fetch('/api/admin/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module_id: selectedModule }),
    })
    const data = await res.json()
    setGenerating(false)
    if (res.ok) setCodes(prev => [data, ...prev])
  }

  const copy = (code: string) => navigator.clipboard.writeText(code)

  const statusColor = (s: string) => {
    if (s === 'active') return { bg: 'var(--green)', text: 'var(--green)' }
    if (s === 'redeemed') return { bg: 'var(--muted)', text: 'var(--muted)' }
    return { bg: 'var(--red)', text: 'var(--red)' }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-syne font-extrabold text-3xl mb-1">Access Codes</h1>
          <p className="text-[var(--muted)]">Generate and track unique purchase codes.</p>
        </div>
        <div className="flex gap-3 items-center">
          <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] transition-colors">
            {modules.map(m => <option key={m.id} value={m.id}>{m.code}</option>)}
          </select>
          <button onClick={generateCode} disabled={generating}
            className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl px-5 py-2.5 text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-50">
            {generating ? '…' : '+ Generate code'}
          </button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--card-hover)]">
              {['Code','Module','Status','Redeemed by','Created'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-[var(--muted)] font-syne font-bold uppercase tracking-wider">{h}</th>
              ))}
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c, i) => {
              const sc = statusColor(c.status)
              return (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="px-5 py-3 font-mono font-bold text-[var(--accent)] text-xs tracking-wider">{c.code}</td>
                  <td className="px-5 py-3">
                    {c.modules && <span className="bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-syne font-bold px-2 py-0.5 rounded">{c.modules.code}</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span style={{ color: sc.text, background: sc.text + '20' }} className="text-xs font-syne font-bold px-2 py-0.5 rounded capitalize">{c.status}</span>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)] text-xs">{c.profiles?.email ?? '—'}</td>
                  <td className="px-5 py-3 text-[var(--muted)] text-xs">{new Date(c.created_at).toLocaleDateString('en-ZA')}</td>
                  <td className="px-5 py-3">
                    {c.status === 'active' && (
                      <button onClick={() => copy(c.code)} className="text-xs text-[var(--muted)] hover:text-white transition-colors">Copy</button>
                    )}
                  </td>
                </tr>
              )
            })}
            {codes.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-[var(--muted)]">No codes yet. Generate your first one! 🔑</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
