'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const BookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const navItems = [
  { id: 'dashboard', label: '今天', href: '/dashboard' },
  { id: 'journals', label: '我的日记', href: '/journals' },
]

export function TopNav({
  initials = 'MJ',
  avatarBg = 'linear-gradient(135deg, #D4A574, #B8895A)',
}: {
  initials?: string
  avatarBg?: string
}) {
  const pathname = usePathname()
  const router = useRouter()

  const active = navItems.find(item => pathname.startsWith(item.href))?.id ?? ''

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="nav-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
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
          <span className="nav-brand-text" style={{ font: '500 16px/1 var(--font-ui)', letterSpacing: 0.2, color: 'var(--text)' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Logout */}
        <button
          onClick={handleLogout}
          title="退出登录"
          style={{
            width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--text-faint)',
            display: 'grid', placeItems: 'center',
          }}>
          <LogOutIcon />
        </button>

        {/* Avatar → settings */}
        <Link href="/settings" title="账号设置" style={{ textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: avatarBg,
            border: '1.5px solid var(--border-strong)',
            display: 'grid', placeItems: 'center',
            color: '#1A1A1A',
            font: '600 12px/1 var(--font-ui)',
            cursor: 'pointer',
          }}>
            {initials}
          </div>
        </Link>
      </div>
    </header>
  )
}
