import { supabase } from './supabaseClient'

export async function getFeed(limit = 20) {
  const { data, error } = await supabase
    .from('feed')
    .select('*')
    .order('fecha_creacion', { ascending: false })
    .limit(limit)

  if (error) throw error

  return data
}