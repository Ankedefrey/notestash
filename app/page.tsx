import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  // Get active modules for display
  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('active', true)
    .order('code')

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center font-syne font-black text-black text-sm">N</div>
            <span className="font-syne font-extrabold text-lg tracking-tight">NoteStash</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-white rounded-lg px-4 py-2 text-sm font-syne font-semibold transition-all">Log in</Link>
            <Link href="/register" className="bg-[var(--accent)] text-black font-syne font-bold rounded-lg px-4 py-2 text-sm hover:-translate-y-0.5 transition-transform">Get notes →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full px-3 py-1 text-xs font-syne font-bold mb-6">✦ STK110 now live</div>
          <h1 className="font-syne font-extrabold text-5xl md:text-6xl leading-tight tracking-tighter mb-6">
            Study notes that<br/><span className="text-[var(--accent)]">actually make sense.</span>
          </h1>
          <p className="text-[var(--muted)] text-lg leading-relaxed mb-8 max-w-md">
            Curated, exam-focused PDF notes for university stats modules. Pay by EFT, get a code, start studying. No subscription, no stress.
          </p>
          <div className="flex gap-3 flex-wrap mb-8">
            <Link href="/register" className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl px-7 py-3.5 text-base hover:-translate-y-0.5 transition-transform shadow-lg shadow-[var(--accent)]/20">Get STK110 notes →</Link>
            <a href="#how" className="border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-xl px-5 py-3.5 text-sm font-syne font-semibold transition-all">How it works</a>
          </div>
          <div className="flex gap-6 text-[var(--muted)] text-sm">
            {[['📄','PDF notes'],['🔒','Secure viewer'],['⚡','Instant access']].map(([icon,label]) => (
              <span key={label} className="flex items-center gap-1.5">{icon} {label}</span>
            ))}
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="absolute inset-0 translate-x-3 translate-y-3 bg-[var(--accent)]/10 rounded-2xl border border-[var(--accent)]/20" />
          <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-syne font-bold px-2 py-1 rounded-md">STK110</span>
                <div className="font-syne font-bold text-xl mt-2">Introductory Statistics</div>
              </div>
              <div className="font-syne font-extrabold text-3xl text-[var(--accent)]">R149</div>
            </div>
            {['Probability Fundamentals','Random Variables','Sampling Distributions','🔥 Exam Prep Mega Pack'].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-2.5 ${i<3?'border-b border-[var(--border)]':''}`}>
                <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center text-sm">📄</div>
                <span className={`text-sm ${i===3?'text-[var(--accent)]':''}`}>{item}</span>
              </div>
            ))}
            <Link href="/register" className="block w-full text-center bg-[var(--accent)] text-black font-syne font-bold rounded-xl py-3 mt-5 hover:-translate-y-0.5 transition-transform">Buy access — R149</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-[var(--card)] border-y border-[var(--border)] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full px-3 py-1 text-xs font-syne font-bold mb-4">Simple 3-step process</div>
            <h2 className="font-syne font-extrabold text-4xl">How it works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {step:'01',emoji:'💸',title:'Pay by EFT',desc:"Send R149 to our bank account. Use your name + module as the reference (e.g. 'JohnSmith STK110')."},
              {step:'02',emoji:'📲',title:'Receive your code',desc:'We verify your payment (usually within a few hours) and WhatsApp/email you a unique access code.'},
              {step:'03',emoji:'📚',title:'Start studying',desc:'Create an account, redeem your code, and access all notes instantly in our secure built-in viewer.'},
            ].map(({step,emoji,title,desc}) => (
              <div key={step} className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{emoji}</span>
                  <span className="font-syne text-xs font-bold text-[var(--accent)] tracking-widest">STEP {step}</span>
                </div>
                <div className="font-syne font-bold text-xl mb-3">{title}</div>
                <div className="text-[var(--muted)] text-sm leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
          {/* Bank details */}
          <div className="mt-10 p-6 bg-[var(--accent)]/8 border border-[var(--accent)]/25 rounded-2xl flex gap-5 items-start">
            <span className="text-4xl">🏦</span>
            <div>
              <div className="font-syne font-bold mb-3">EFT Banking Details</div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-[var(--muted)]">
                {[['Account name','NoteStash (Pty) Ltd'],['Bank','FNB'],['Account number','62XXXXXXXXX'],['Branch code','250655'],['Reference','YourName + ModuleCode']].map(([k,v]) => (
                  <div key={k}><span className="text-white">{k}:</span> {v}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="max-w-4xl mx-auto py-20 px-6">
        <div className="text-center mb-12">
          <h2 className="font-syne font-extrabold text-4xl">Available modules</h2>
          <p className="text-[var(--muted)] mt-2">More coming soon. Poke us if yours isn't listed.</p>
        </div>
        <div className="flex flex-col gap-4">
          {(modules ?? []).map(m => (
            <div key={m.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <span className="bg-[var(--accent)]/15 text-[var(--accent)] text-sm font-syne font-bold px-2.5 py-1 rounded-lg">{m.code}</span>
                <div>
                  <div className="font-syne font-bold">{m.name}</div>
                  <div className="text-[var(--muted)] text-sm mt-0.5">{m.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="font-syne font-extrabold text-2xl text-[var(--accent)]">R{m.price_zar}</div>
                </div>
                <Link href="/register" className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl px-5 py-2.5 text-sm hover:-translate-y-0.5 transition-transform">Get access →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] py-10 px-6 text-center text-[var(--muted)] text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-5 h-5 bg-[var(--accent)] rounded-md flex items-center justify-center font-black text-black text-xs">N</div>
          <span className="font-syne font-extrabold">NoteStash</span>
        </div>
        <div>© 2025 NoteStash · Built with 💛 for students · <a href="mailto:hey@notestash.co.za" className="hover:text-white transition-colors">hey@notestash.co.za</a></div>
      </footer>
    </div>
  )
}
