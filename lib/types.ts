export interface Journal {
  id: string
  user_id: string
  title: string | null
  content: string
  ai_insight: string | null
  mood_label: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
}
