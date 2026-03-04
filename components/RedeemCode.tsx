'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RedeemCode() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const redeem = async () => {
    if (!code.trim()) return
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/codes/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setMessage({ type: 'success', text: data.message })
      setCode('')
      router.refresh()
    } else {
      setMessage({ type: 'error', text: data.error })
    }
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
      <div className="font-syne font-bold text-base mb-1">🔑 Redeem access code</div>
      <div className="text-[var(--muted)] text-sm mb-4">Got a code from us? Enter it below to unlock your module.</div>
      <div className="flex gap-3">
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && redeem()}
          placeholder="e.g. UNLK-A7X2-9QP1"
          className="flex-1 bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors font-mono tracking-wider"
        />
        <button onClick={redeem} disabled={loading || !code.trim()}
          className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl px-5 py-2.5 text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-50 flex-shrink-0">
          {loading ? '…' : 'Redeem'}
        </button>
      </div>
      {message && (
        <div className={`mt-3 px-4 py-3 rounded-xl text-sm border ${message.type === 'success' ? 'bg-[var(--green)]/10 border-[var(--green)]/30 text-[var(--green)]' : 'bg-[var(--red)]/10 border-[var(--red)]/30 text-[var(--red)]'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
