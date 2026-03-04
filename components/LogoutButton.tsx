'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={logout}
      className="border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-lg px-3 py-1.5 text-sm font-syne font-semibold transition-all">
      Log out
    </button>
  )
}
