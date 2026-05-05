'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getJournal } from '@/lib/supabase'
import type { Journal } from '@/lib/types'
import { TopNav } from '@/components/TopNav'

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5 M11 18l-6-6 6-6" />
    </svg>
  )
}
function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
      <circle cx="12" cy="12" r="3.2"/>
    </svg>
  )
}

const moodColors: Record<string, string> = {
  '笃定': '#D4A574', '平静': '#8FB4D9', '温柔': '#E0A0B8',
  '迷茫': '#A89A8C', '释然': '#A0C2A8', '焦虑': '#D4956A',
  '喜悦': '#C8D494', '感恩': '#94C8B4',
}

function parseInsight(text: string) {
  const lines = text.split('\n').filter(l => l.trim())
  let moodLine = ''
  let themes: string[] = []
  let body = ''
  let closing = ''

  // Try to parse structured format from Claude
  const moodMatch = text.match(/情绪[：:]\s*(.+)/i)
  const themeMatch = text.match(/主题[：:]\s*(.+)/i)

  if (moodMatch) moodLine = moodMatch[1].trim()
  if (themeMatch) themes = themeMatch[1].split(/[,，、]/).map(s => s.trim()).filter(Boolean).slice(0, 3)

  // Use lines as body/closing if structured parsing fails
  if (!moodLine) {
    body = lines.slice(0, -1).join('\n\n')
    closing = lines[lines.length - 1] ?? ''
  } else {
    const rest = lines.filter(l => !l.match(/^(情绪|主题)[：:]/i))
    body = rest.slice(0, -1).join('\n\n')
    closing = rest[rest.length - 1] ?? ''
  }

  return { moodLine: moodLine || '难以言说', themes: themes.length ? themes : ['成长', '反思'], body: body || text, closing }
}

export default function JournalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [journal, setJournal] = useState<Journal | null>(null)
  const [loading, setLoading] = useState(true)
  const [initials, setInitials] = useState('MJ')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setInitials(user.email?.slice(0, 2).toUpperCase() ?? 'MJ')

      const j = await getJournal(params.id as string)
      if (!j || j.user_id !== user.id) { router.push('/dashboard'); return }
      setJournal(j)
      setLoading(false)
    }
    load()
  }, [params.id, router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', placeItems: 'center' }}>
        <div style={{ color: 'var(--text-faint)', font: '400 14px/1 var(--font-ui)' }}>加载中…</div>
      </div>
    )
  }
  if (!journal) return null

  const createdAt = new Date(journal.created_at)
  const dateStr = createdAt.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = createdAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  const wordCount = journal.content.replace(/\s/g, '').length

  const insight = journal.ai_insight ? parseInsight(journal.ai_insight) : null
  const moodColor = journal.mood_label ? (moodColors[journal.mood_label] ?? 'var(--gold)') : 'var(--gold)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopNav initials={initials} />

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 100px' }}>
        {/* Breadcrumb */}
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', display: 'flex', alignItems: 'center', gap: 8, font: '400 13px/1 var(--font-ui)', padding: 0, marginBottom: 32 }}>
          <BackIcon /> 返回
        </button>

        {/* Journal entry */}
        <article style={{
          padding: '28px 32px', border: '1px solid var(--border)', borderRadius: 14,
          background: 'var(--bg-card)', marginBottom: 36,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              {journal.title && (
                <h2 style={{ font: '400 22px/1.3 var(--font-serif)', color: 'var(--text)', margin: '0 0 8px' }}>
                  {journal.title}
                </h2>
              )}
              <div style={{ font: '400 12.5px/1 var(--font-ui)', color: 'var(--text-faint)' }}>
                {dateStr} {timeStr} · {wordCount} 字
              </div>
            </div>
            <button
              onClick={() => setExpanded(e => !e)}
              style={{ background: 'none', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', color: 'var(--text-mute)', font: '400 12px/1 var(--font-ui)' }}>
              {expanded ? '收起' : '展开全文'}
            </button>
          </div>
          <div style={{
            font: '400 15px/1.7 var(--font-serif)', color: 'var(--text-mute)',
            ...(expanded ? {} : {
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
            }),
            whiteSpace: 'pre-wrap',
          }}>
            {journal.content}
          </div>
        </article>

        {/* AI Insight */}
        {insight ? (
          <section style={{
            position: 'relative',
            padding: '44px 44px 40px',
            borderRadius: 18,
            background: 'radial-gradient(ellipse at top, rgba(212,165,116,0.10), transparent 60%), var(--bg-elev)',
            border: '1px solid var(--gold-dim)',
            overflow: 'hidden',
            animation: 'reveal 700ms ease-out',
          }}>
            {/* Top shimmer line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.6 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <span style={{ color: 'var(--gold)' }}><SparkIcon /></span>
              <span style={{ font: '500 11px/1 var(--font-ui)', color: 'var(--gold)', letterSpacing: 1.6, textTransform: 'uppercase' }}>
                来自 AI 的洞察
              </span>
            </div>

            {/* Mood + themes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <div>
                <div style={{ font: '500 11px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 14 }}>
                  情绪基调
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${moodColor}, ${moodColor}88)`, boxShadow: `0 0 20px ${moodColor}40`, flexShrink: 0 }} />
                  <div>
                    <div style={{ font: '400 20px/1 var(--font-serif)', color: 'var(--text)' }}>
                      {journal.mood_label ?? insight.moodLine}
                    </div>
                    <div style={{ font: '400 12px/1 var(--font-ui)', color: 'var(--text-faint)', marginTop: 6 }}>
                      {insight.moodLine !== journal.mood_label ? insight.moodLine : ''}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ font: '500 11px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 14 }}>
                  核心主题
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {insight.themes.map(t => (
                    <span key={t} style={{
                      padding: '8px 14px', borderRadius: 6,
                      border: '1px solid var(--gold)', color: 'var(--gold)',
                      font: '500 13px/1 var(--font-ui)',
                      background: 'var(--gold-faint)',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 28px' }} />

            {/* Insight body */}
            <div style={{ font: '500 11px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 14 }}>
              洞察
            </div>
            <div style={{ font: '400 19px/1.7 var(--font-serif)', color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 0 }}>
              {insight.body}
            </div>

            {/* Closing */}
            {insight.closing && (
              <div style={{
                marginTop: 28, padding: '18px 22px',
                background: 'rgba(245,240,232,0.03)',
                borderLeft: '2px solid var(--gold)',
                borderRadius: '0 8px 8px 0',
                font: '400 15px/1.6 var(--font-serif)', color: 'var(--text)',
              }}>
                {insight.closing}
              </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/journal/new" style={{
                padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-mute)',
                font: '400 12.5px/1 var(--font-ui)', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                继续写今天
              </Link>
              <Link href="/dashboard" style={{
                font: '400 12px/1 var(--font-ui)', color: 'var(--text-faint)', textDecoration: 'none',
              }}>
                返回主页 →
              </Link>
            </div>
          </section>
        ) : (
          <div style={{
            padding: '40px 32px', borderRadius: 14, border: '1px dashed var(--border-strong)',
            textAlign: 'center',
          }}>
            <p style={{ font: '400 15px/1.6 var(--font-serif)', color: 'var(--text-mute)', margin: '0 0 20px' }}>
              AI 洞察还未生成
            </p>
            <p style={{ font: '400 13px/1 var(--font-ui)', color: 'var(--text-faint)', margin: 0 }}>
              请确认 GEMINI_API_KEY 已在环境变量中配置
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
