'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Wrong email or password. Try again bestie 😬')
      setLoading(false)
      return
    }
    // Middleware will redirect based on role
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-[var(--border)] px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center font-syne font-black text-black text-sm">N</div>
          <span className="font-syne font-extrabold text-lg tracking-tight">NoteStash</span>
        </Link>
        <Link href="/register" className="border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-lg px-4 py-2 text-sm font-syne font-semibold transition-all">
          Create account →
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl p-9 animate-fade-up">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">👋</div>
            <h1 className="font-syne font-extrabold text-2xl">Welcome back</h1>
            <p className="text-[var(--muted)] text-sm mt-2">Miss you bestie. Let's get back to studying.</p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">Email address</label>
              <input type="email" placeholder="you@university.ac.za" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-semibold block mb-1.5">Password</label>
              <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
            </div>
            {error && (
              <div className="bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-xl px-4 py-3 text-[var(--red)] text-sm">{error}</div>
            )}
            <button onClick={handleLogin} disabled={loading}
              className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl py-3 text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-60 mt-1">
              {loading ? 'Logging in…' : 'Log in →'}
            </button>
          </div>
          <p className="text-center text-[var(--muted)] text-xs mt-6">
            No account? <Link href="/register" className="text-[var(--accent)] font-semibold">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
