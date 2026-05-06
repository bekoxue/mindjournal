'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getJournals } from '@/lib/supabase'
import type { Journal } from '@/lib/types'
import { TopNav } from '@/components/TopNav'

const moodColors: Record<string, string> = {
  '笃定': '#D4A574', '平静': '#8FB4D9', '温柔': '#E0A0B8',
  '迷茫': '#A89A8C', '释然': '#A0C2A8', '焦虑': '#D4956A',
  '喜悦': '#C8D494', '感恩': '#94C8B4',
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
  )
}
function ChevIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
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

export default function JournalsPage() {
  const router = useRouter()
  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [initials, setInitials] = useState('MJ')
  const [search, setSearch] = useState('')
  const [moodFilter, setMoodFilter] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setInitials(user.email?.slice(0, 2).toUpperCase() ?? 'MJ')
      const all = await getJournals(user.id)
      setJournals(all)
      setLoading(false)
    }
    load()
  }, [router])

  const allMoods = Array.from(new Set(journals.map(j => j.mood_label).filter(Boolean))) as string[]

  const filtered = journals.filter(j => {
    const matchSearch = !search || j.content.includes(search) || (j.title ?? '').includes(search)
    const matchMood = !moodFilter || j.mood_label === moodFilter
    return matchSearch && matchMood
  })

  // Group by month
  const groups: Record<string, Journal[]> = {}
  filtered.forEach(j => {
    const d = new Date(j.created_at)
    const key = `${d.getFullYear()}年${d.getMonth() + 1}月`
    if (!groups[key]) groups[key] = []
    groups[key].push(j)
  })

  // Stats
  const totalWords = journals.reduce((s, j) => s + j.content.replace(/\s/g, '').length, 0)
  const moodCounts = journals.reduce((acc, j) => {
    if (j.mood_label) acc[j.mood_label] = (acc[j.mood_label] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', placeItems: 'center' }}>
        <div style={{ color: 'var(--text-faint)', font: '400 14px/1 var(--font-ui)' }}>加载中…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopNav initials={initials} />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div style={{ font: '400 12px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>
              全部日记
            </div>
            <h1 style={{ font: '400 34px/1.2 var(--font-serif)', color: 'var(--text)', margin: 0 }}>
              我的日记
            </h1>
          </div>
          <Link href="/journal/new" style={{
            padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'var(--gold)', color: '#1A1A1A',
            font: '600 13px/1 var(--font-ui)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            textDecoration: 'none',
          }}>
            写今天的日记 <ArrowIcon />
          </Link>
        </div>

        {/* Stats row */}
        {journals.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
            {[
              { label: '总篇数', value: `${journals.length} 篇` },
              { label: '总字数', value: `${totalWords.toLocaleString()} 字` },
              { label: '最常出现情绪', value: topMood ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '18px 20px',
              }}>
                <div style={{ font: '400 11px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
                  {label}
                </div>
                <div style={{ font: '400 22px/1 var(--font-serif)', color: 'var(--text)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 14px',
          }}>
            <span style={{ color: 'var(--text-faint)' }}><SearchIcon /></span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索日记内容…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                font: '400 14px/1 var(--font-ui)', color: 'var(--text)',
              }}
            />
          </div>
          {allMoods.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                onClick={() => setMoodFilter(null)}
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
                  background: moodFilter === null ? 'var(--gold-dim)' : 'transparent',
                  color: moodFilter === null ? 'var(--gold)' : 'var(--text-mute)',
                  font: '500 12px/1 var(--font-ui)', cursor: 'pointer',
                }}>
                全部
              </button>
              {allMoods.map(mood => (
                <button
                  key={mood}
                  onClick={() => setMoodFilter(mood === moodFilter ? null : mood)}
                  style={{
                    padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${moodFilter === mood ? moodColors[mood] ?? 'var(--border)' : 'var(--border)'}`,
                    background: moodFilter === mood ? `${moodColors[mood]}18` : 'transparent',
                    color: moodFilter === mood ? (moodColors[mood] ?? 'var(--text)') : 'var(--text-mute)',
                    font: '500 12px/1 var(--font-ui)', cursor: 'pointer',
                  }}>
                  {mood}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Journal list grouped by month */}
        {filtered.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', border: '1px dashed var(--border-strong)', borderRadius: 12 }}>
            <p style={{ font: '400 16px/1.6 var(--font-serif)', color: 'var(--text-mute)', margin: '0 0 24px' }}>
              {search || moodFilter ? '没有找到匹配的日记' : '还没有日记，开始写第一篇吧'}
            </p>
            {!search && !moodFilter && (
              <Link href="/journal/new" style={{ padding: '12px 22px', borderRadius: 10, textDecoration: 'none', background: 'var(--gold)', color: '#1A1A1A', font: '600 14px/1 var(--font-ui)' }}>
                写第一篇日记
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {Object.entries(groups).map(([month, items]) => (
              <div key={month}>
                <div style={{
                  font: '500 11px/1 var(--font-ui)', color: 'var(--text-faint)',
                  letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 16,
                }}>
                  {month} · {items.length} 篇
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {items.map((j) => {
                    const d = new Date(j.created_at)
                    const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
                    const moodColor = j.mood_label ? (moodColors[j.mood_label] ?? 'var(--text-mute)') : null
                    return (
                      <Link key={j.id} href={`/journal/${j.id}`} style={{
                        background: 'var(--bg)', padding: '20px 24px',
                        display: 'grid', gridTemplateColumns: '80px 1fr auto 20px',
                        gap: 20, alignItems: 'center', textDecoration: 'none',
                      }}>
                        <div>
                          <div style={{ font: '500 14px/1.2 var(--font-ui)', color: 'var(--text)' }}>
                            {d.getMonth() + 1}/{d.getDate()}
                          </div>
                          <div style={{ font: '400 11px/1.2 var(--font-ui)', color: 'var(--text-faint)', marginTop: 3 }}>
                            周{weekday}
                          </div>
                        </div>
                        <div>
                          {j.title && (
                            <div style={{ font: '400 15px/1.3 var(--font-serif)', color: 'var(--text)', marginBottom: 5 }}>
                              {j.title}
                            </div>
                          )}
                          <div style={{
                            font: '400 13px/1.5 var(--font-ui)', color: 'var(--text-mute)',
                            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                            WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const,
                          }}>
                            {j.content.slice(0, 80)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {moodColor && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, font: '500 12px/1 var(--font-ui)', color: moodColor }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: moodColor }} />
                              {j.mood_label}
                            </span>
                          )}
                          <span style={{ font: '400 11px/1 var(--font-ui)', color: 'var(--text-faint)' }}>
                            {j.content.replace(/\s/g, '').length} 字
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-faint)' }}>
                          <ChevIcon />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
