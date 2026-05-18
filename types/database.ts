export type UserRole = 'becado' | 'docente' | 'administrador'
export type ProcedureStatus = 'pendiente' | 'validado' | 'rechazado' | 'correccion_solicitada'
export type ProcedureName = 'Intubación' | 'Punción lumbar' | 'Catéter venoso central' | 'Línea arterial' | 'Toracocentesis' | 'Paracentesis' | 'Otro'

export type Usuario = {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: UserRole
  activo: boolean
  fecha_creacion: string
}

export type Procedimiento = {
  id: string
  becado_id: string
  tutor_id: string
  procedimiento: ProcedureName
  iniciales_paciente: string
  patologia_contexto: string
  dificultad: boolean
  exitoso: boolean
  complicaciones: boolean
  comentario_becado: string | null
  estado_validacion: ProcedureStatus
  comentario_docente: string | null
  fecha_hora_registro: string
  fecha_hora_validacion: string | null
  creado_en: string
  actualizado_en: string
}

export type ProcedimientoConUsuarios = Procedimiento & {
  becado: Pick<Usuario, 'nombre' | 'apellido' | 'email'>
  tutor: Pick<Usuario, 'nombre' | 'apellido' | 'email'>
}
