import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav */}
      <header className="landing-header" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{
            padding: '10px 18px', borderRadius: 8, textDecoration: 'none',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-mute)', font: '500 13px/1 var(--font-ui)',
          }}>
            登录
          </Link>
          <Link href="/register" style={{
            padding: '10px 18px', borderRadius: 8, textDecoration: 'none',
            background: 'var(--gold)', color: '#1A1A1A',
            font: '600 13px/1 var(--font-ui)',
          }}>
            免费开始
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="landing-hero" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999,
          background: 'var(--gold-faint)',
          border: '1px solid var(--gold-dim)',
          marginBottom: 32,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4A574" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
            <circle cx="12" cy="12" r="3.2"/>
          </svg>
          <span style={{ font: '500 12px/1 var(--font-ui)', color: 'var(--gold)', letterSpacing: 0.4 }}>
            由 Claude AI 驱动
          </span>
        </div>

        <h1 style={{
          font: '400 clamp(36px, 9vw, 64px)/1.15 var(--font-serif)',
          color: 'var(--text)', margin: '0 0 24px',
          letterSpacing: -0.5, maxWidth: 720,
        }}>
          写下今天，<br />
          <span style={{ color: 'var(--gold)' }}>读懂自己。</span>
        </h1>

        <p style={{
          font: '400 clamp(15px, 4vw, 19px)/1.7 var(--font-ui)',
          color: 'var(--text-mute)', margin: '0 0 40px',
          maxWidth: 520,
        }}>
          每一篇日记，AI 都会帮你看见文字背后的情绪模式、思维惯性和成长信号。
          那些你隐约感觉到但从未能清晰表达的东西。
        </p>

        <Link href="/register" style={{
          padding: '16px 32px', borderRadius: 12, textDecoration: 'none',
          background: 'var(--gold)', color: '#1A1A1A',
          font: '600 16px/1 var(--font-ui)',
          boxShadow: '0 8px 32px rgba(212,165,116,0.3)',
          display: 'inline-flex', alignItems: 'center', gap: 10,
        }}>
          开始记录
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14 M13 6l6 6-6 6" />
          </svg>
        </Link>

      </main>
    </div>
  )
}
