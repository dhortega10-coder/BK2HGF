import { supabase } from './supabaseClient'

export async function getDashboardBecados() {
  const { data, error } = await supabase.from('dashboard_becados').select('*').order('total_procedimientos', { ascending: false })
  if (error) throw error
  return data
}

export async function getProceduresByType() {
  const { data, error } = await supabase.from('procedimientos_por_tipo').select('*')
  if (error) throw error
  return data
}

export async function getFeed(limit = 20) {
  const { data, error } = await supabase.from('feed').select('*').order('fecha_creacion', { ascending: false }).limit(limit)
  if (error) throw error
  return data
}
