import { supabase } from './supabaseClient'

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUserProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('Auth error:', authError)
    return null
  }

  if (!authData.user) {
    return null
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (error) {
    console.error('Profile error:', error)
    return null
  }

  return data
}