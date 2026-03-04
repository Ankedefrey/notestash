import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

const navItems = [
  { href: '/admin', label: 'Overview', icon: '📊', exact: true },
  { href: '/admin/modules', label: 'Modules', icon: '📚' },
  { href: '/admin/codes', label: 'Access Codes', icon: '🔑' },
  { href: '/admin/payments', label: 'Payments', icon: '💸' },
  { href: '/admin/activity', label: 'Activity', icon: '🔍' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[var(--card)] border-r border-[var(--border)] flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-[var(--accent)] rounded-md flex items-center justify-center font-syne font-black text-black text-xs">N</div>
            <span className="font-syne font-extrabold tracking-tight">NoteStash</span>
          </div>
          <span className="bg-[var(--red)]/15 text-[var(--red)] text-xs font-syne font-bold px-2 py-0.5 rounded-md">Admin</span>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-syne font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] transition-all mb-1">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--border)]">
          <div className="text-xs text-[var(--muted)] mb-2 truncate">{user.email}</div>
          <LogoutButton />
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
