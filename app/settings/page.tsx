'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TopNav } from '@/components/TopNav'

import { AVATAR_COLORS as AVATAR_COLOR_LIST, getAvatarBg, getInitials } from '@/lib/avatar'

const AVATAR_COLORS = [
  { bg: AVATAR_COLOR_LIST[0], label: '金褐' },
  { bg: AVATAR_COLOR_LIST[1], label: '静蓝' },
  { bg: AVATAR_COLOR_LIST[2], label: '松绿' },
  { bg: AVATAR_COLOR_LIST[3], label: '暮紫' },
  { bg: AVATAR_COLOR_LIST[4], label: '橙赤' },
  { bg: AVATAR_COLOR_LIST[5], label: '薰衣' },
]

type Section = 'profile' | 'password' | 'notifications'

interface NotifPrefs {
  dailyReminder: boolean
  weeklyDigest: boolean
  aiInsightAlert: boolean
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
function EyeIcon({ off }: { off?: boolean }) {
  if (off) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Profile
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarColor, setAvatarColor] = useState(0)

  // Password
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    dailyReminder: true,
    weeklyDigest: false,
    aiInsightAlert: true,
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')
      const meta = user.user_metadata ?? {}
      setDisplayName(meta.display_name ?? '')
      setAvatarColor(meta.avatar_color ?? 0)
      if (meta.notif_prefs) setNotifPrefs(meta.notif_prefs)
      setLoading(false)
    }
    load()
  }, [router])

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName.trim(), avatar_color: avatarColor },
    })
    setSaving(false)
    if (error) showToast('保存失败：' + error.message, false)
    else showToast('个人资料已更新')
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) { showToast('两次输入的新密码不一致', false); return }
    if (newPwd.length < 6) { showToast('密码至少需要 6 位', false); return }
    setSaving(true)
    // Verify current password first
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: currentPwd })
    if (signInErr) {
      setSaving(false)
      showToast('当前密码错误，请重试', false)
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSaving(false)
    if (error) showToast('密码更新失败：' + error.message, false)
    else {
      showToast('密码已更新')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    }
  }

  async function saveNotifications(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { notif_prefs: notifPrefs } })
    setSaving(false)
    if (error) showToast('保存失败：' + error.message, false)
    else showToast('通知偏好已保存')
  }

  const initials = getInitials(displayName, email)
  const avatarBg = getAvatarBg(avatarColor)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', placeItems: 'center' }}>
        <div style={{ color: 'var(--text-faint)', font: '400 14px/1 var(--font-ui)' }}>加载中…</div>
      </div>
    )
  }

  const sections: { id: Section; label: string }[] = [
    { id: 'profile', label: '个人资料' },
    { id: 'password', label: '修改密码' },
    { id: 'notifications', label: '通知偏好' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopNav initials={initials} avatarBg={avatarBg} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000,
          padding: '12px 20px', borderRadius: 10,
          background: toast.ok ? 'rgba(160,194,168,0.15)' : 'rgba(224,112,112,0.15)',
          border: `1px solid ${toast.ok ? 'rgba(160,194,168,0.35)' : 'rgba(224,112,112,0.35)'}`,
          color: toast.ok ? '#A0C2A8' : '#E07070',
          font: '500 13px/1 var(--font-ui)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'reveal 0.2s ease',
        }}>
          {toast.ok && <CheckIcon />}
          {toast.msg}
        </div>
      )}

      <main className="page-main" style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ font: '400 32px/1.2 var(--font-serif)', color: 'var(--text)', margin: '0 0 8px' }}>
            设置
          </h1>
          <p style={{ font: '400 14px/1 var(--font-ui)', color: 'var(--text-mute)', margin: 0 }}>
            管理你的账号、密码和通知偏好
          </p>
        </div>

        <div className="settings-layout">
          {/* Sidebar */}
          <nav className="settings-sidebar">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                textAlign: 'left',
                background: activeSection === s.id ? 'var(--gold-dim)' : 'transparent',
                color: activeSection === s.id ? 'var(--gold)' : 'var(--text-mute)',
                font: `${activeSection === s.id ? '500' : '400'} 14px/1 var(--font-ui)`,
                transition: 'background 0.15s',
              }}>
                {s.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '32px 36px',
          }}>

            {/* ── Profile ── */}
            {activeSection === 'profile' && (
              <form onSubmit={saveProfile}>
                <h2 style={{ font: '400 20px/1 var(--font-serif)', color: 'var(--text)', margin: '0 0 28px' }}>
                  个人资料
                </h2>

                {/* Avatar preview */}
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>头像</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 10 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: avatarBg,
                      border: '2px solid var(--border-strong)',
                      display: 'grid', placeItems: 'center',
                      color: '#1A1A1A',
                      font: '600 20px/1 var(--font-ui)',
                      flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                    <div>
                      <p style={{ font: '400 12px/1.5 var(--font-ui)', color: 'var(--text-faint)', margin: '0 0 10px' }}>
                        选择头像主题色
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {AVATAR_COLORS.map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setAvatarColor(i)}
                            title={c.label}
                            style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: c.bg, border: 'none', cursor: 'pointer',
                              outline: avatarColor === i ? '2px solid var(--gold)' : '2px solid transparent',
                              outlineOffset: 2,
                              transition: 'outline 0.12s',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display name */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>显示名称</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="你的昵称（可选）"
                    maxLength={30}
                    style={inputStyle}
                  />
                  <p style={{ font: '400 12px/1 var(--font-ui)', color: 'var(--text-faint)', marginTop: 6 }}>
                    头像字母将优先使用显示名称的前两个字符
                  </p>
                </div>

                {/* Email (read-only) */}
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>邮箱</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                  />
                </div>

                <button type="submit" disabled={saving} style={primaryBtnStyle(saving)}>
                  {saving ? '保存中…' : '保存资料'}
                </button>
              </form>
            )}

            {/* ── Password ── */}
            {activeSection === 'password' && (
              <form onSubmit={savePassword}>
                <h2 style={{ font: '400 20px/1 var(--font-serif)', color: 'var(--text)', margin: '0 0 28px' }}>
                  修改密码
                </h2>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>当前密码</label>
                  <div style={pwdWrap}>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPwd}
                      onChange={e => setCurrentPwd(e.target.value)}
                      required
                      placeholder="输入当前密码"
                      style={{ ...inputStyle, paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowCurrent(v => !v)} style={eyeBtn}>
                      <EyeIcon off={showCurrent} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>新密码</label>
                  <div style={pwdWrap}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      required
                      placeholder="至少 6 位"
                      style={{ ...inputStyle, paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)} style={eyeBtn}>
                      <EyeIcon off={showNew} />
                    </button>
                  </div>
                  {newPwd.length > 0 && (
                    <PasswordStrength pwd={newPwd} />
                  )}
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>确认新密码</label>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    required
                    placeholder="再次输入新密码"
                    style={{
                      ...inputStyle,
                      borderColor: confirmPwd && confirmPwd !== newPwd
                        ? 'rgba(224,112,112,0.5)'
                        : undefined,
                    }}
                  />
                  {confirmPwd && confirmPwd !== newPwd && (
                    <p style={{ font: '400 12px/1 var(--font-ui)', color: '#E07070', marginTop: 6 }}>
                      两次密码不一致
                    </p>
                  )}
                </div>

                <button type="submit" disabled={saving} style={primaryBtnStyle(saving)}>
                  {saving ? '更新中…' : '更新密码'}
                </button>
              </form>
            )}

            {/* ── Notifications ── */}
            {activeSection === 'notifications' && (
              <form onSubmit={saveNotifications}>
                <h2 style={{ font: '400 20px/1 var(--font-serif)', color: 'var(--text)', margin: '0 0 8px' }}>
                  通知偏好
                </h2>
                <p style={{ font: '400 13px/1.5 var(--font-ui)', color: 'var(--text-faint)', margin: '0 0 28px' }}>
                  选择你希望接收的提醒类型（通知将发送至你的注册邮箱）
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <NotifToggle
                    label="每日写作提醒"
                    desc="每天晚上 9 点提醒你记录今天"
                    checked={notifPrefs.dailyReminder}
                    onChange={v => setNotifPrefs(p => ({ ...p, dailyReminder: v }))}
                  />
                  <NotifToggle
                    label="每周日记摘要"
                    desc="每周日发送本周情绪与成长报告"
                    checked={notifPrefs.weeklyDigest}
                    onChange={v => setNotifPrefs(p => ({ ...p, weeklyDigest: v }))}
                  />
                  <NotifToggle
                    label="AI 洞察通知"
                    desc="当 AI 生成新的成长洞察时通知你"
                    checked={notifPrefs.aiInsightAlert}
                    onChange={v => setNotifPrefs(p => ({ ...p, aiInsightAlert: v }))}
                  />
                </div>

                <div style={{ marginTop: 32 }}>
                  <button type="submit" disabled={saving} style={primaryBtnStyle(saving)}>
                    {saving ? '保存中…' : '保存偏好'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function NotifToggle({ label, desc, checked, onChange }: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 18px', borderRadius: 10,
      background: checked ? 'var(--gold-faint)' : 'rgba(245,240,232,0.03)',
      border: `1px solid ${checked ? 'rgba(212,165,116,0.2)' : 'var(--border)'}`,
      cursor: 'pointer',
      transition: 'background 0.15s, border-color 0.15s',
    }}>
      <div>
        <div style={{ font: '500 14px/1 var(--font-ui)', color: 'var(--text)', marginBottom: 5 }}>
          {label}
        </div>
        <div style={{ font: '400 12px/1.4 var(--font-ui)', color: 'var(--text-faint)' }}>
          {desc}
        </div>
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 42, height: 24, borderRadius: 12, flexShrink: 0,
          background: checked ? 'var(--gold)' : 'rgba(245,240,232,0.12)',
          position: 'relative', cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 21 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: checked ? '#1A1A1A' : 'rgba(245,240,232,0.5)',
          transition: 'left 0.2s',
        }} />
      </div>
    </label>
  )
}

function PasswordStrength({ pwd }: { pwd: string }) {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  const levels = [
    { label: '弱', color: '#E07070' },
    { label: '一般', color: '#D4956A' },
    { label: '较强', color: '#C8D494' },
    { label: '强', color: '#A0C2A8' },
  ]
  const lv = levels[Math.min(score, 3)]

  return (
    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 3, flex: 1 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score - 1 ? lv.color : 'rgba(245,240,232,0.1)',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      <span style={{ font: '400 11px/1 var(--font-ui)', color: lv.color, minWidth: 24 }}>
        {lv.label}
      </span>
    </div>
  )
}

// ── Style helpers ─────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  font: '500 11px/1 var(--font-ui)',
  color: 'var(--text-faint)',
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: 'var(--bg-input)', border: '1px solid var(--border-strong)',
  color: 'var(--text)', font: '400 14px/1 var(--font-ui)',
  outline: 'none', boxSizing: 'border-box',
}

const pwdWrap: React.CSSProperties = {
  position: 'relative',
}

const eyeBtn: React.CSSProperties = {
  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-faint)', display: 'grid', placeItems: 'center',
  padding: 4,
}

function primaryBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '12px 22px', borderRadius: 10, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? 'rgba(212,165,116,0.4)' : 'var(--gold)',
    color: '#1A1A1A', font: '600 14px/1 var(--font-ui)',
  }
}
