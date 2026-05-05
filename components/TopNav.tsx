'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const BookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
  </svg>
)
const SettingsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .67.39 1.27 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.24.61.84 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const navItems = [
  { id: 'dashboard', label: '今天', href: '/dashboard' },
  { id: 'journals', label: '我的日记', href: '/journals' },
]

export function TopNav({ initials = 'MJ' }: { initials?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const active = navItems.find(item => pathname.startsWith(item.href))?.id ?? 'dashboard'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 48px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #D4A574, #B8895A)',
            display: 'grid', placeItems: 'center',
            color: '#1A1A1A',
          }}>
            <BookIcon />
          </div>
          <span style={{ font: '500 16px/1 var(--font-ui)', letterSpacing: 0.2, color: 'var(--text)' }}>
            MindJournal
          </span>
        </Link>
        <nav style={{ display: 'flex', gap: 4 }}>
          {navItems.map(item => (
            <Link key={item.id} href={item.href} style={{
              padding: '8px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              background: active === item.id ? 'rgba(245,240,232,0.06)' : 'transparent',
              color: active === item.id ? 'var(--text)' : 'var(--text-mute)',
              font: '500 13.5px/1 var(--font-ui)',
            }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--text-mute)', display: 'grid', placeItems: 'center' }}>
          <SearchIcon />
        </button>
        <button
          onClick={handleLogout}
          title="退出登录"
          style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--text-mute)', display: 'grid', placeItems: 'center' }}>
          <SettingsIcon />
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3a3a3a, #1f1f1f)',
          border: '1px solid var(--border-strong)',
          display: 'grid', placeItems: 'center',
          color: 'var(--gold)',
          font: '500 12px/1 var(--font-ui)',
        }}>
          {initials}
        </div>
      </div>
    </header>
  )
}
