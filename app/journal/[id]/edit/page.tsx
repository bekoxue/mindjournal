'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { supabase, getJournal, updateJournal, updateJournalInsight } from '@/lib/supabase'

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

export default function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const j = await getJournal(id)
      if (!j || j.user_id !== user.id) { router.push('/dashboard'); return }

      setTitle(j.title ?? '')
      setContent(j.content)
      setLoading(false)
    }
    load()
  }, [id, router])

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
    setError('')
    setSaving(true)
    try {
      await updateJournal(id, content, title || undefined)

      // Re-analyze with AI
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ journalId: id, content }),
      })
      if (res.ok) {
        const { insight, moodLabel } = await res.json()
        await updateJournalInsight(id, insight, moodLabel)
      }

      router.push(`/journal/${id}`)
    } catch {
      setError('保存失败，请重试')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#161616', display: 'grid', placeItems: 'center' }}>
        <div style={{ color: 'var(--text-faint)', font: '400 14px/1 var(--font-ui)' }}>加载中…</div>
      </div>
    )
  }

  const now = new Date()
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · 编辑`

  return (
    <div style={{ minHeight: '100vh', background: '#161616', position: 'relative' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '1px solid var(--border)',
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', display: 'flex', alignItems: 'center', gap: 8, font: '400 13px/1 var(--font-ui)' }}>
          <BackIcon /> 取消
        </button>
        <div style={{ font: '400 12.5px/1 var(--font-ui)', color: 'var(--text-faint)' }}>
          {dateStr}
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
          {saving ? '保存中…' : '保存修改'}
        </button>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px 160px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ font: '400 12px/1 var(--font-ui)', color: 'var(--text-faint)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 14 }}>
            标题
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="给这篇日记一个标题（可留空）"
            style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              font: '400 36px/1.3 var(--font-serif)', color: 'var(--text)', padding: 0,
            }}
          />
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="写下你的想法…"
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none', resize: 'none',
            font: '400 18px/1.85 var(--font-serif)', color: 'var(--text)',
            minHeight: 380, padding: 0,
          }}
        />

        {error && (
          <p style={{ font: '400 13px/1 var(--font-ui)', color: '#E07070', marginTop: 16 }}>{error}</p>
        )}
      </main>

      <div style={{
        position: 'fixed', left: '50%', bottom: 32, transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px',
        background: 'rgba(28,28,28,0.92)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-strong)', borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)', zIndex: 10,
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
