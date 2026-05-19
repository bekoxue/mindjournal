import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const MAX_CONTENT_LENGTH = 5000

// 模块级内存限速（无状态函数冷启动后重置，对个人应用已足够）
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

const SYSTEM_INSTRUCTION = `你是一位受过专业训练的反思导师，具备心理咨询和情绪分析的能力。请分析用户提供的日记，给出深度洞察。

请严格按照以下格式输出（每行一项，不要添加其他说明）：

情绪：[用2-4个字描述核心情绪基调，如：笃定、平静、迷茫、释然、焦虑、喜悦等]
主题：[2-3个核心主题词，用逗号分隔，如：成长，选择，勇气]

[空一行]

[2-3段洞察正文，每段2-3句话，帮助作者看见文字背后的深层含义、思维模式或成长信号。语气温暖而有深度，像一位真正读懂了这篇文字的朋友在说话。]

[最后一行：一句鼓励性结语，15-25字，不要说教，要有温度和具体感]`

export async function POST(req: NextRequest) {
  // Fix 1: 认证 — 验证 Bearer token
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: '认证失败' }, { status: 401 })
  }

  // Fix 3: 限速 — 每 IP 每分钟最多 10 次
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 })
  }

  const { content } = await req.json()

  // Fix 2: 内容长度双侧限制
  if (!content || content.trim().length < 20) {
    return NextResponse.json({ error: '内容太短' }, { status: 400 })
  }
  if (content.trim().length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: '内容过长，请控制在 5000 字以内' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 服务未配置' }, { status: 503 })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    // Fix 4: 指令放入 systemInstruction，用户内容单独传入，阻断 prompt injection
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    const result = await model.generateContent(content)
    const text = result.response.text()

    const moodMatch = text.match(/^情绪[：:]\s*(.+)/m)
    const moodLabel = moodMatch ? moodMatch[1].trim() : '难以言说'

    return NextResponse.json({ insight: text, moodLabel })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ error: 'AI 分析失败，请稍后重试' }, { status: 500 })
  }
}
