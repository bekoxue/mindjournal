'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getJournals, getTodayJournal } from '@/lib/supabase'
import type { Journal, User } from '@/lib/types'
import { TopNav } from '@/components/TopNav'
import { getAvatarBg, getInitials } from '@/lib/avatar'

const moodColors: Record<string, string> = {
  '笃定': '#D4A574', '平静': '#8FB4D9', '温柔': '#E0A0B8',
  '迷茫': '#A89A8C', '释然': '#A0C2A8', '焦虑': '#D4956A',
  '喜悦': '#C8D494', '感恩': '#94C8B4',
}

function FlameIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1.5.7-2.5 1.5-3.5C8 8 7 10 7 12a5 5 0 0 0 10 0c0-4-5-10-5-10z" />
    </svg>
  )
}
function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
      <circle cx="12" cy="12" r="3.2"/>
    </svg>
  )
}
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14 M13 6l6 6-6 6" />
    </svg>
  )
}
function ChevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
function PenIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9 M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [journals, setJournals] = useState<Journal[]>([])
  const [todayDone, setTodayDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarBg, setAvatarBg] = useState(getAvatarBg(0))
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/login'); return }
      setUser({ id: u.id, email: u.email! })
      const meta = u.user_metadata ?? {}
      setDisplayName(meta.display_name ?? '')
      setAvatarBg(getAvatarBg(meta.avatar_color ?? 0))

      const [all, today] = await Promise.all([
        getJournals(u.id),
        getTodayJournal(u.id),
      ])
      setJournals(all)
      setTodayDone(!!today)
      setLoading(false)
    }
    load()
  }, [router])

  const now = new Date()
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`

  // Build 7-day strip
  const strip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - 6 + i)
    return d
  })
  const journalDates = new Set(journals.map(j => j.created_at.slice(0, 10)))
  const stripWritten = strip.map(d => journalDates.has(d.toISOString().slice(0, 10)))

  // Greeting based on hour
  const hour = now.getHours()
  const greeting = hour < 6 ? '深夜好' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'

  const initials = getInitials(displayName, user?.email ?? '')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', placeItems: 'center' }}>
        <div style={{ color: 'var(--text-faint)', font: '400 14px/1 var(--font-ui)' }}>加载中…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopNav initials={initials} avatarBg={avatarBg} />

      <main className="page-main" style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ font: '400 13px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
            {weekday} · {dateStr}
          </div>
          <h1 style={{ font: '400 clamp(28px, 8vw, 40px)/1.2 var(--font-serif)', color: 'var(--text)', margin: 0, letterSpacing: -0.3 }}>
            {greeting}，<span style={{ color: 'var(--gold)' }}>{user?.email?.split('@')[0]}</span>。<br />
            今天，你想从哪里开始？
          </h1>
        </div>

        {/* Today CTA */}
        <section className="today-cta" style={{
          background: 'linear-gradient(180deg, var(--bg-elev) 0%, var(--bg-card) 100%)',
          border: '1px solid var(--border-strong)',
          borderRadius: 16,
          padding: '28px 28px',
          marginBottom: 40,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, var(--gold), transparent)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 10px', borderRadius: 999, font: '500 11px/1 var(--font-ui)', background: 'var(--gold-dim)', color: 'var(--gold)', letterSpacing: 0.4 }}>
                {todayDone ? '今天已记录 ✓' : '今天还没记录'}
              </span>
              {journals.length > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 999, font: '500 11px/1 var(--font-ui)', background: 'transparent', color: 'var(--text-faint)', border: '1px solid var(--border)' }}>
                  <FlameIcon /> {journals.length} 篇日记
                </span>
              )}
            </div>
            <h2 style={{ font: '400 24px/1.3 var(--font-serif)', color: 'var(--text)', margin: '0 0 6px' }}>
              {todayDone ? '今天的日记已完成，你还可以继续' : '今天发生了什么值得记下来的事？'}
            </h2>
            <p style={{ font: '400 14px/1.5 var(--font-ui)', color: 'var(--text-mute)', margin: 0 }}>
              不需要长，甚至不需要完整。一句话，也是一篇日记。
            </p>
          </div>
          <Link href="/journal/new" className="today-cta-btn" style={{
            padding: '14px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'var(--gold)', color: '#1A1A1A',
            font: '600 14px/1 var(--font-ui)',
            display: 'flex', alignItems: 'center', gap: 10,
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(212,165,116,0.25)',
            flexShrink: 0,
          }}>
            {todayDone ? '继续写今天' : '写今天的日记'} <ArrowIcon />
          </Link>
        </section>

        {/* Two-column: AI summary + week strip */}
        <section className="grid-two-col" style={{ marginBottom: 40 }}>
          {/* AI observation */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ color: 'var(--gold)' }}><SparkIcon /></span>
              <span style={{ font: '500 11px/1 var(--font-ui)', color: 'var(--gold)', letterSpacing: 1.4, textTransform: 'uppercase' }}>
                来自 AI 的本周观察
              </span>
            </div>
            {journals.length >= 3 ? (
              <p style={{ font: '400 17px/1.55 var(--font-serif)', color: 'var(--text)', margin: 0 }}>
                你已经积累了 <span style={{ color: 'var(--gold)' }}>{journals.length} 篇</span> 日记。AI 正在学习你的思维模式，继续记录以解锁跨篇分析。
              </p>
            ) : (
              <p style={{ font: '400 17px/1.55 var(--font-serif)', color: 'var(--text-mute)', margin: 0 }}>
                写下 3 篇日记后，AI 将开始为你生成跨日记的成长洞察。
              </p>
            )}
          </div>

          {/* Week strip */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
              <span style={{ font: '500 11px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1.4, textTransform: 'uppercase' }}>
                本周记录
              </span>
              <span style={{ font: '400 13px/1 var(--font-ui)', color: 'var(--text-mute)' }}>
                {stripWritten.filter(Boolean).length} / 7 天
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
              {strip.map((d, i) => {
                const isToday = i === 6
                const has = stripWritten[i]
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      height: 44, borderRadius: 6,
                      background: has ? 'var(--gold-dim)' : 'rgba(245,240,232,0.04)',
                      border: isToday ? '1px dashed var(--gold)' : `1px solid ${has ? 'transparent' : 'var(--border)'}`,
                      display: 'grid', placeItems: 'center',
                      color: has ? 'var(--gold)' : 'var(--text-faint)',
                    }}>
                      {has ? <CheckIcon /> : (isToday ? <PenIcon /> : null)}
                    </div>
                    <div style={{ font: '400 11px/1 var(--font-ui)', color: 'var(--text-faint)', marginTop: 8 }}>
                      {['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Journal list */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <h3 style={{ font: '400 20px/1 var(--font-serif)', color: 'var(--text)', margin: 0 }}>
              我的日记
            </h3>
            <span style={{ font: '400 13px/1 var(--font-ui)', color: 'var(--text-mute)' }}>
              共 {journals.length} 篇
            </span>
          </div>

          {journals.length === 0 ? (
            <div style={{
              padding: '64px 32px', textAlign: 'center',
              border: '1px dashed var(--border-strong)', borderRadius: 12,
            }}>
              <p style={{ font: '400 18px/1.6 var(--font-serif)', color: 'var(--text-mute)', margin: '0 0 24px' }}>
                你的第一篇日记在等待诞生。<br />写下今天，AI 将帮你读懂自己。
              </p>
              <Link href="/journal/new" style={{
                padding: '12px 22px', borderRadius: 10, textDecoration: 'none',
                background: 'var(--gold)', color: '#1A1A1A',
                font: '600 14px/1 var(--font-ui)',
              }}>
                写第一篇日记
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
              {journals.map((j) => (
                <Link key={j.id} href={`/journal/${j.id}`} className="journal-row" style={{
                  background: 'var(--bg)',
                  padding: '18px 26px',
                  textDecoration: 'none',
                }}>
                  <div>
                    <div style={{ font: '500 15px/1.2 var(--font-ui)', color: 'var(--text)' }}>
                      {new Date(j.created_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                    </div>
                    <div style={{ font: '400 12px/1.2 var(--font-ui)', color: 'var(--text-faint)', marginTop: 4 }}>
                      {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(j.created_at).getDay()]}
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    {j.title && (
                      <h4 style={{ font: '400 15px/1.3 var(--font-serif)', color: 'var(--text)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.title}</h4>
                    )}
                    <p style={{
                      font: '400 13px/1.5 var(--font-ui)', color: 'var(--text-mute)', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {j.content.slice(0, 80)}
                    </p>
                  </div>
                  <div className="journal-row-meta">
                    {j.mood_label && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        font: '500 12px/1 var(--font-ui)',
                        color: moodColors[j.mood_label] ?? 'var(--text-mute)',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: moodColors[j.mood_label] ?? 'var(--text-mute)' }} />
                        {j.mood_label}
                      </span>
                    )}
                    <span style={{ font: '400 11px/1 var(--font-ui)', color: 'var(--text-faint)' }}>
                      {j.content.replace(/\s/g, '').length} 字
                    </span>
                  </div>
                  <div className="journal-row-chevron" style={{ color: 'var(--text-faint)' }}>
                    <ChevIcon />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
