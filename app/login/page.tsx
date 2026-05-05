'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('邮箱或密码错误，请重试')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', justifyContent: 'center', marginBottom: 48 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #D4A574, #B8895A)',
            display: 'grid', placeItems: 'center', color: '#1A1A1A',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span style={{ font: '500 16px/1 var(--font-ui)', color: 'var(--text)' }}>MindJournal</span>
        </Link>

        <h1 style={{ font: '400 28px/1.3 var(--font-serif)', color: 'var(--text)', margin: '0 0 8px', textAlign: 'center' }}>
          欢迎回来
        </h1>
        <p style={{ font: '400 14px/1 var(--font-ui)', color: 'var(--text-mute)', margin: '0 0 40px', textAlign: 'center' }}>
          登录以继续你的成长记录
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', font: '500 12px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                background: 'var(--bg-input)', border: '1px solid var(--border-strong)',
                color: 'var(--text)', font: '400 15px/1 var(--font-ui)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', font: '500 12px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                background: 'var(--bg-input)', border: '1px solid var(--border-strong)',
                color: 'var(--text)', font: '400 15px/1 var(--font-ui)',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{ font: '400 13px/1 var(--font-ui)', color: '#E07070', margin: 0 }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '13px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'rgba(212,165,116,0.5)' : 'var(--gold)',
            color: '#1A1A1A', font: '600 14px/1 var(--font-ui)',
            marginTop: 8,
          }}>
            {loading ? '登录中…' : '登录'}
          </button>
        </form>

        <p style={{ font: '400 13px/1 var(--font-ui)', color: 'var(--text-mute)', margin: '28px 0 0', textAlign: 'center' }}>
          还没有账号？{' '}
          <Link href="/register" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            免费注册
          </Link>
        </p>
      </div>
    </div>
  )
}
