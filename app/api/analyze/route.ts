import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { content } = await req.json()

  if (!content || content.trim().length < 20) {
    return NextResponse.json({ error: '内容太短' }, { status: 400 })
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(`你是一位受过专业训练的反思导师，具备心理咨询和情绪分析的能力。请分析这篇日记，给出深度洞察。

日记内容：
${content}

请严格按照以下格式输出（每行一项，不要添加其他说明）：

情绪：[用2-4个字描述核心情绪基调，如：笃定、平静、迷茫、释然、焦虑、喜悦等]
主题：[2-3个核心主题词，用逗号分隔，如：成长，选择，勇气]

[空一行]

[2-3段洞察正文，每段2-3句话，帮助作者看见文字背后的深层含义、思维模式或成长信号。语气温暖而有深度，像一位真正读懂了这篇文字的朋友在说话。]

[最后一行：一句鼓励性结语，15-25字，不要说教，要有温度和具体感]`)

    const text = result.response.text()

    const moodMatch = text.match(/^情绪[：:]\s*(.+)/m)
    const moodLabel = moodMatch ? moodMatch[1].trim() : '难以言说'

    return NextResponse.json({ insight: text, moodLabel })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ error: 'AI 分析失败，请稍后重试' }, { status: 500 })
  }
}
