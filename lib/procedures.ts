import { supabase } from './supabaseClient'
import type { ProcedureName, ProcedimientoConUsuarios } from '@/types/database'

export async function getDocentes() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .in('rol', ['docente', 'administrador'])
    .eq('activo', true)
    .order('apellido')

  if (error) throw error
  return data
}

export async function createProcedure(input: {
  becado_id: string
  tutor_id: string
  procedimiento: ProcedureName
  iniciales_paciente: string
  patologia_contexto: string
  dificultad: boolean
  exitoso: boolean
  complicaciones: boolean
  comentario_becado?: string | null
}) {
  const { data, error } = await supabase
    .from('procedimientos')
    .insert({
      ...input,
      iniciales_paciente: input.iniciales_paciente.toUpperCase().trim(),
      patologia_contexto: input.patologia_contexto.trim(),
      comentario_becado: input.comentario_becado?.trim() || null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function getPendingProcedures(): Promise<ProcedimientoConUsuarios[]> {
  const { data, error } = await supabase
    .from('procedimientos')
    .select(
      `*, becado:usuarios!procedimientos_becado_id_fkey(nombre, apellido, email), tutor:usuarios!procedimientos_tutor_id_fkey(nombre, apellido, email)`
    )
    .eq('estado_validacion', 'pendiente')
    .order('fecha_hora_registro', { ascending: false })

  if (error) throw error
  return data as ProcedimientoConUsuarios[]
}

export async function getMyProcedures(userId: string) {
  const { data, error } = await supabase
    .from('procedimientos')
    .select('*')
    .eq('becado_id', userId)
    .order('fecha_hora_registro', { ascending: false })

  if (error) throw error
  return data
}

export async function getHomeStats(userId: string, isDocente: boolean) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  if (isDocente) {
    const { count: pendientes, error: pendingError } = await supabase
      .from('procedimientos')
      .select('*', { count: 'exact', head: true })
      .eq('estado_validacion', 'pendiente')

    if (pendingError) throw pendingError

    const { count: semana, error: weekError } = await supabase
      .from('procedimientos')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_hora_registro', sevenDaysAgo.toISOString())

    if (weekError) throw weekError

    return {
      pendientes: pendientes ?? 0,
      semana: semana ?? 0,
      personales: 0,
    }
  }

  const { count: personales, error: personalError } = await supabase
    .from('procedimientos')
    .select('*', { count: 'exact', head: true })
    .eq('becado_id', userId)

  if (personalError) throw personalError

  const { count: semana, error: weekError } = await supabase
    .from('procedimientos')
    .select('*', { count: 'exact', head: true })
    .eq('becado_id', userId)
    .gte('fecha_hora_registro', sevenDaysAgo.toISOString())

  if (weekError) throw weekError

  return {
    pendientes: 0,
    semana: semana ?? 0,
    personales: personales ?? 0,
  }
}