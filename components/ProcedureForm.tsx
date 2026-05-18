'use client'
import { useEffect, useState } from 'react'
import { createProcedure, getDocentes } from '@/lib/procedures'
import { getCurrentUserProfile } from '@/lib/auth'
import type { ProcedureName, Usuario } from '@/types/database'

const PROCEDURES: ProcedureName[] = ['Intubación','Punción lumbar','Catéter venoso central','Línea arterial','Toracocentesis','Paracentesis','Otro']

export default function ProcedureForm() {
  const [user, setUser] = useState<Usuario | null>(null)
  const [docentes, setDocentes] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState({ tutor_id: '', procedimiento: 'Intubación' as ProcedureName, iniciales_paciente: '', patologia_contexto: '', dificultad: false, exitoso: true, complicaciones: false, comentario_becado: '' })

  useEffect(() => { async function load(){ try { setUser(await getCurrentUserProfile()); setDocentes(await getDocentes() as Usuario[]) } catch { setMessage('Configura Supabase e inicia sesión para usar el formulario real.') } } load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!user) return setMessage('Debes iniciar sesión.'); if (!form.tutor_id) return setMessage('Selecciona tutor.'); if (!form.iniciales_paciente.trim()) return setMessage('Ingresa iniciales.'); if (!form.patologia_contexto.trim()) return setMessage('Ingresa contexto.')
    try { setLoading(true); await createProcedure({ becado_id: user.id, ...form }); setMessage('Procedimiento registrado. Se notificó al tutor.'); setForm({ tutor_id: '', procedimiento: 'Intubación', iniciales_paciente: '', patologia_contexto: '', dificultad: false, exitoso: true, complicaciones: false, comentario_becado: '' }) } catch { setMessage('No se pudo registrar. Revisa permisos/conexión.') } finally { setLoading(false) }
  }

  return <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
    <Field label="Procedimiento"><select value={form.procedimiento} onChange={e=>setForm({...form, procedimiento:e.target.value as ProcedureName})} className="w-full rounded-2xl border border-white/10 bg-[#0c1921] p-4">{PROCEDURES.map(p=><option key={p}>{p}</option>)}</select></Field>
    <Field label="Tutor de turno"><select value={form.tutor_id} onChange={e=>setForm({...form, tutor_id:e.target.value})} className="w-full rounded-2xl border border-white/10 bg-[#0c1921] p-4"><option value="">Seleccionar tutor</option>{docentes.map(d=><option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}</select></Field>
    <Field label="Iniciales paciente"><input value={form.iniciales_paciente} maxLength={6} onChange={e=>setForm({...form, iniciales_paciente:e.target.value.toUpperCase()})} placeholder="Ej: JPR" className="w-full rounded-2xl border border-white/10 bg-[#0c1921] p-4 uppercase" /></Field>
    <Field label="Patología / contexto"><textarea value={form.patologia_contexto} onChange={e=>setForm({...form, patologia_contexto:e.target.value})} placeholder="Ej: shock séptico..." className="min-h-24 w-full rounded-2xl border border-white/10 bg-[#0c1921] p-4" /></Field>
    <Bool label="¿Dificultad?" value={form.dificultad} onChange={v=>setForm({...form,dificultad:v})}/>
    <Bool label="¿Procedimiento exitoso?" value={form.exitoso} onChange={v=>setForm({...form,exitoso:v})}/>
    <Bool label="¿Complicaciones?" value={form.complicaciones} onChange={v=>setForm({...form,complicaciones:v})}/>
    <Field label="Comentario opcional"><textarea value={form.comentario_becado} onChange={e=>setForm({...form, comentario_becado:e.target.value})} className="min-h-20 w-full rounded-2xl border border-white/10 bg-[#0c1921] p-4" /></Field>
    {message && <p className="rounded-2xl bg-white/10 p-3 text-sm text-white/80">{message}</p>}
    <button disabled={loading} className="w-full rounded-2xl bg-emerald-400 py-4 font-bold text-slate-950 disabled:opacity-50">{loading?'Registrando...':'Registrar procedimiento'}</button>
  </form>
}
function Field({label, children}:{label:string, children:React.ReactNode}){return <div><label className="mb-2 block text-sm text-white/70">{label}</label>{children}</div>}
function Bool({label,value,onChange}:{label:string,value:boolean,onChange:(v:boolean)=>void}){return <div><p className="mb-2 text-sm font-medium text-white/80">{label}</p><div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1"><button type="button" onClick={()=>onChange(true)} className={`rounded-xl py-3 text-sm font-bold ${value?'bg-cyan-400 text-slate-950':'text-white/50'}`}>Sí</button><button type="button" onClick={()=>onChange(false)} className={`rounded-xl py-3 text-sm font-bold ${!value?'bg-cyan-400 text-slate-950':'text-white/50'}`}>No</button></div></div>}
