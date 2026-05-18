import { supabase } from './supabaseClient'
import type { ProcedureStatus } from '@/types/database'

export async function validateProcedure(procedureId: string, estado: ProcedureStatus, comentario?: string) {
  const { error } = await supabase.rpc('validar_procedimiento', {
    p_procedimiento_id: procedureId,
    p_estado: estado,
    p_comentario: comentario?.trim() || null,
  })
  if (error) throw error
}
