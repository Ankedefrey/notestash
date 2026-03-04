'use client'
import { useEffect, useState } from 'react'

interface Module {
  id: string
  code: string
  name: string
  description?: string
  price_zar: number
  active: boolean
  pdfs?: any[]
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', description: '', price_zar: 149 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/modules').then(r => r.json()).then(setModules)
  }, [])

  const addModule = async () => {
    if (!form.code || !form.name) return
    setLoading(true)
    const res = await fetch('/api/admin/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setModules(prev => [...prev, data])
      setForm({ code: '', name: '', description: '', price_zar: 149 })
      setShowForm(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-syne font-extrabold text-3xl mb-1">Modules</h1>
          <p className="text-[var(--muted)]">Manage course modules and their PDFs.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl px-5 py-2.5 text-sm hover:-translate-y-0.5 transition-transform">+ Add module</button>
      </div>

      {showForm && (
        <div className="mb-6 bg-[var(--card)] border border-[var(--accent)]/30 rounded-2xl p-6">
          <div className="font-syne font-bold text-lg mb-5">➕ Add new module</div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">Module code (e.g. STK110)</label>
              <input placeholder="STK110" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors font-mono" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">Module name</label>
              <input placeholder="Introductory Statistics" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">Description</label>
              <input placeholder="Brief description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">Price (Rands)</label>
              <input type="number" value={form.price_zar} onChange={e => setForm(p => ({ ...p, price_zar: Number(e.target.value) }))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addModule} disabled={loading} className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl px-6 py-2.5 text-sm disabled:opacity-50">
              {loading ? 'Adding…' : '✅ Add module'}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-xl px-5 py-2.5 text-sm font-syne font-semibold transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {modules.map(m => (
          <div key={m.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="bg-[var(--accent)]/15 text-[var(--accent)] text-sm font-syne font-bold px-2.5 py-1 rounded-lg">{m.code}</span>
                <div>
                  <div className="font-syne font-bold">{m.name}</div>
                  <div className="text-[var(--muted)] text-xs mt-0.5">{m.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-syne font-bold text-[var(--accent)]">R{m.price_zar}</span>
                <span className="text-xs text-[var(--muted)]">{m.pdfs?.length ?? 0} PDFs</span>
                <button className="border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-lg px-3 py-1.5 text-xs font-syne font-semibold transition-all">Edit</button>
                <button className="bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25 rounded-lg px-3 py-1.5 text-xs font-syne font-semibold transition-all">+ Upload PDF</button>
              </div>
            </div>
            {(m.pdfs?.length ?? 0) > 0 && (
              <div className="border-t border-[var(--border)]">
                {m.pdfs!.filter(p => p.active).map((pdf, i) => (
                  <div key={pdf.id} className={`flex items-center justify-between px-6 py-3 text-sm ${i < m.pdfs!.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span>📄</span>
                      <span>{pdf.title}</span>
                      {pdf.page_count && <span className="text-[var(--muted)] text-xs">{pdf.page_count}p</span>}
                    </div>
                    <button className="text-[var(--red)] text-xs hover:opacity-70 transition-opacity">Remove</button>
                  </div>
                ))}
              </div>
            )}
            {(m.pdfs?.length ?? 0) === 0 && (
              <div className="px-6 py-4 border-t border-[var(--border)] text-sm text-[var(--muted)]">No PDFs uploaded yet. Add some! 📄</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
