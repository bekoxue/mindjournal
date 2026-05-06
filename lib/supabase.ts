import { createClient } from '@supabase/supabase-js'
import type { Journal } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getJournals(userId: string): Promise<Journal[]> {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getJournal(id: string): Promise<Journal | null> {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createJournal(
  userId: string,
  content: string,
  title?: string
): Promise<Journal> {
  const { data, error } = await supabase
    .from('journals')
    .insert({ user_id: userId, content, title: title || null })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateJournalInsight(
  id: string,
  aiInsight: string,
  moodLabel: string
): Promise<void> {
  const { error } = await supabase
    .from('journals')
    .update({ ai_insight: aiInsight, mood_label: moodLabel })
    .eq('id', id)

  if (error) throw error
}

export async function updateJournal(
  id: string,
  content: string,
  title?: string
): Promise<Journal> {
  const { data, error } = await supabase
    .from('journals')
    .update({ content, title: title || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteJournal(id: string): Promise<void> {
  const { error } = await supabase
    .from('journals')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getTodayJournal(userId: string): Promise<Journal | null> {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

  const { data } = await supabase
    .from('journals')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', start)
    .lt('created_at', end)
    .single()

  return data ?? null
}
