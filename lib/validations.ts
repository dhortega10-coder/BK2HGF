import { supabase } from './supabaseClient'

export async function validateProcedure(
  procedureId: string,
  estado: 'validado' | 'rechazado' | 'correccion_solicitada'
) {
  const { data: proc, error: readError } = await supabase
    .from('procedimientos')
    .select(`
      id,
      procedimiento,
      becado_id,
      tutor_id,
      becado:usuarios!procedimientos_becado_id_fkey(nombre, apellido),
      tutor:usuarios!procedimientos_tutor_id_fkey(nombre, apellido)
    `)
    .eq('id', procedureId)
    .single()

  if (readError) throw readError

  const { error: updateError } = await supabase
    .from('procedimientos')
    .update({
      estado_validacion: estado,
      fecha_hora_validacion: new Date().toISOString(),
    })
    .eq('id', procedureId)

  if (updateError) throw updateError

  if (estado === 'validado') {
    const becado = Array.isArray(proc.becado) ? proc.becado[0] : proc.becado
    const tutor = Array.isArray(proc.tutor) ? proc.tutor[0] : proc.tutor

    await supabase.from('feed').insert({
      procedimiento_id: procedureId,
      tipo_evento: 'procedimiento_validado',
      visible_para: 'todos',
      mensaje: `✅ ${becado?.nombre ?? 'Becado/a'} ${becado?.apellido ?? ''} completó ${proc.procedimiento} validado por ${tutor?.nombre ?? 'tutor/a'} ${tutor?.apellido ?? ''}. ¡Buen avance!`,
    })

    await supabase.from('notificaciones').insert({
      usuario_destino_id: proc.becado_id,
      procedimiento_id: procedureId,
      tipo: 'validacion',
      mensaje: `Tu procedimiento fue validado por ${tutor?.nombre ?? 'tu tutor/a'} ${tutor?.apellido ?? ''}. Buen avance.`,
    })
  }

  if (estado === 'rechazado') {
    await supabase.from('notificaciones').insert({
      usuario_destino_id: proc.becado_id,
      procedimiento_id: procedureId,
      tipo: 'rechazo',
      mensaje: 'Tu registro fue rechazado por el tutor.',
    })
  }

  if (estado === 'correccion_solicitada') {
    await supabase.from('notificaciones').insert({
      usuario_destino_id: proc.becado_id,
      procedimiento_id: procedureId,
      tipo: 'correccion',
      mensaje: 'Tu registro requiere corrección por parte del tutor.',
    })
  }
}