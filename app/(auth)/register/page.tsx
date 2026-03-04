'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    if (!email || !password) return
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl p-9 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="font-syne font-extrabold text-2xl mb-3">Check your email!</h2>
        <p className="text-[var(--muted)] text-sm leading-relaxed">We sent a confirmation link to <strong className="text-white">{email}</strong>. Click it to activate your account, then come back here to log in.</p>
        <Link href="/login" className="block mt-6 bg-[var(--accent)] text-black font-syne font-bold rounded-xl py-3 text-sm">Go to login →</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-[var(--border)] px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center font-syne font-black text-black text-sm">N</div>
          <span className="font-syne font-extrabold text-lg tracking-tight">NoteStash</span>
        </Link>
        <Link href="/login" className="border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-lg px-4 py-2 text-sm font-syne font-semibold transition-all">
          Already have an account?
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl p-9 animate-fade-up">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">✨</div>
            <h1 className="font-syne font-extrabold text-2xl">Create account</h1>
            <p className="text-[var(--muted)] text-sm mt-2">Join thousands of students getting better marks.</p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">Email address</label>
              <input type="email" placeholder="you@university.ac.za" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">Password (min 8 characters)</label>
              <input type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
            </div>
            {error && (
              <div className="bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-xl px-4 py-3 text-[var(--red)] text-sm">{error}</div>
            )}
            <button onClick={handleRegister} disabled={loading}
              className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl py-3 text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-60 mt-1">
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </div>
          <p className="text-[var(--muted)] text-xs text-center mt-6">
            By signing up you agree to our <a href="#" className="text-[var(--accent)]">Terms of Service</a>. Notes are for personal use only.
          </p>
        </div>
      </div>
    </div>
  )
}
