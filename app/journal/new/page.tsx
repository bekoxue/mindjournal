'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, createJournal, updateJournalInsight, getTodayJournal } from '@/lib/supabase'

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5 M11 18l-6-6 6-6" />
    </svg>
  )
}
function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
      <circle cx="12" cy="12" r="3.2"/>
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18 M6 6l12 12" />
    </svg>
  )
}

export default function NewJournalPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const now = new Date()
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]}`

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      // Check if already wrote today, load that entry
      const today = await getTodayJournal(user.id)
      if (today) {
        setTitle(today.title ?? '')
        setContent(today.content)
      }
    }
    load()
  }, [router])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  const wordCount = content.replace(/\s/g, '').length

  async function handleSave() {
    if (wordCount < 20) {
      setError('再多写一点吧（至少 20 字）')
      return
    }
    if (!userId) return
    setError('')
    setSaving(true)
    try {
      const journal = await createJournal(userId, content, title || undefined)

      // Call AI analyze API
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalId: journal.id, content }),
      })
      if (res.ok) {
        const { insight, moodLabel } = await res.json()
        await updateJournalInsight(journal.id, insight, moodLabel)
      }

      router.push(`/journal/${journal.id}`)
    } catch {
      setError('保存失败，请重试')
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#161616', position: 'relative' }}>
      {/* Minimal top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px',
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', display: 'flex', alignItems: 'center', gap: 8, font: '400 13px/1 var(--font-ui)' }}>
          <BackIcon /> 返回
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, font: '400 12.5px/1 var(--font-ui)', color: 'var(--text-faint)' }}>
          <span>{dateStr}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-faint)' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 0 3px var(--gold-dim)' }} />
            自动草稿
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 18px', borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            background: saving ? 'rgba(212,165,116,0.5)' : 'var(--gold)',
            color: '#1A1A1A', font: '600 13px/1 var(--font-ui)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
          <SparkIcon />
          {saving ? '生成洞察中…' : '保存并获取洞察'}
        </button>
      </header>

      {/* Editor area */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px 160px' }}>
        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ font: '400 12px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 14 }}>
            今日
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="给今天一个标题（可留空，AI 将替你拟一个）"
            style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              font: '400 36px/1.3 var(--font-serif)', color: 'var(--text)',
              padding: 0,
            }}
          />
        </div>

        {/* Body textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="今天发生了什么？你在想什么？有什么让你触动了？"
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none', resize: 'none',
            font: '400 18px/1.85 var(--font-serif)', color: 'var(--text)',
            minHeight: 380, padding: 0,
          }}
        />

        {error && (
          <p style={{ font: '400 13px/1 var(--font-ui)', color: '#E07070', marginTop: 16 }}>{error}</p>
        )}

        {/* AI suggestion strip */}
        {showSuggestion && content.length > 80 && (
          <div style={{
            marginTop: 48, padding: '20px 22px', borderRadius: 12,
            background: 'var(--gold-faint)', border: '1px solid var(--gold-dim)',
            display: 'flex', alignItems: 'flex-start', gap: 14,
            animation: 'reveal 400ms ease-out',
          }}>
            <span style={{ color: 'var(--gold)', marginTop: 1 }}><SparkIcon /></span>
            <div style={{ flex: 1 }}>
              <div style={{ font: '500 12px/1 var(--font-ui)', color: 'var(--gold)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                如果你想再深入一点
              </div>
              <div style={{ font: '400 15px/1.55 var(--font-serif)', color: 'var(--text)' }}>
                这件事背后，你最在意的是什么？
              </div>
            </div>
            <button onClick={() => setShowSuggestion(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: 0 }}>
              <CloseIcon />
            </button>
          </div>
        )}
      </main>

      {/* Floating bottom toolbar */}
      <div style={{
        position: 'fixed', left: '50%', bottom: 32, transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px',
        background: 'rgba(28,28,28,0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-strong)',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        zIndex: 10,
      }}>
        <span style={{ font: '400 12px/1 var(--font-ui)', color: 'var(--text-faint)', padding: '0 10px' }}>
          {wordCount} 字
          {wordCount >= 20 && <span style={{ color: 'var(--gold)', marginLeft: 4 }}>· 可以保存了</span>}
          {wordCount > 0 && wordCount < 20 && <span style={{ color: 'var(--text-faint)', marginLeft: 4 }}>· 还差 {20 - wordCount} 字</span>}
        </span>
      </div>
    </div>
  )
}
