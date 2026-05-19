# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指引。

## 常用命令

```bash
npm run dev      # 启动开发服务器（localhost:3000）
npm run build    # 生产构建
npm run start    # 启动生产服务器
```

**重要：** 此项目位于一个类 monorepo 的父目录中，`~/` 下存在多余的 `package.json`/`package-lock.json`，导致 Turbopack 误判工作区根目录。`next.config.ts` 通过手动加载 `.env.local` 来弥补此问题。始终在 `mindjournal/` 目录下运行命令。

## 架构

**技术栈：** Next.js 16.2（App Router、Turbopack）· Supabase（认证 + PostgreSQL）· Gemini 2.5 Flash（AI）· Tailwind CSS v4 · Netlify

**日记条目的数据流：**
1. 用户在 `/journal/new` 编写 → `createJournal()` 保存到 Supabase
2. 客户端向 `POST /api/analyze` 发送内容
3. API 路由使用结构化提示词调用 Gemini 2.5 Flash
4. 响应（情绪标签 + 洞察文本）通过 `updateJournalInsight()` 写回数据库
5. 用户跳转到 `/journal/[id]` 查看 AI 洞察

**认证：** 所有受保护页面在 `useEffect` 中调用 `supabase.auth.getUser()`，无 session 时跳转到 `/login`。不使用中间件，认证在客户端逐页面执行。

**Supabase 辅助函数**位于 `lib/supabase.ts`：`getJournals`、`getJournal`、`createJournal`、`updateJournalInsight`、`getTodayJournal`。客户端使用公开的 anon key 以单例形式创建，**必须使用 JWT 格式（`eyJ...` 开头）**——新版 `sb_publishable_...` 格式与 JS 客户端不兼容。

**AI 洞察格式：** Gemini 提示词强制要求特定输出结构，由 `app/journal/[id]/page.tsx` 中的 `parseInsight()` 解析：
```
情绪：[2-4 个字]
主题：[逗号分隔的关键词]

[2-3 段洞察内容]

[结尾句 15-25 字]
```

## 样式

所有样式使用内联样式配合 CSS 自定义属性——组件中不使用 Tailwind 工具类。设计 token 定义在 `app/globals.css` 的 `:root` 中，并通过 `@theme inline` 暴露给 Tailwind。主要 token：`--bg`、`--gold`、`--text`、`--text-mute`、`--text-faint`、`--font-ui`、`--font-serif`。

## 环境变量

需在 `.env.local` 中配置（不提交到版本控制）：
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # JWT 格式，以 eyJ 开头
GEMINI_API_KEY=
```

## 数据库

Supabase `journals` 表启用了行级安全（RLS）——用户只能访问自己的数据。RLS 策略为 `auth.uid() = user_id`。无 migrations 文件夹，schema 需通过 Supabase SQL 编辑器手动执行。

## 部署

通过 `netlify.toml` 部署到 Netlify。环境变量须在 Netlify 控制台中配置。`@netlify/plugin-nextjs` 插件负责处理 Next.js 运行时。
