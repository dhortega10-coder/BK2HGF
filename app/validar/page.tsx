'use client'
import AppShell from '@/components/AppShell'
import { useEffect, useState } from 'react'
import { getPendingProcedures } from '@/lib/procedures'
import { validateProcedure } from '@/lib/validations'
import type { ProcedimientoConUsuarios } from '@/types/database'

export default function ValidarPage(){
 const [items,setItems]=useState<ProcedimientoConUsuarios[]>([]); const [msg,setMsg]=useState('')
 async function load(){try{setItems(await getPendingProcedures())}catch{setMsg('Configura Supabase e inicia sesión como docente para ver pendientes.')}}
 useEffect(()=>{load()},[])
 async function act(id:string, estado:'validado'|'rechazado'|'correccion_solicitada'){try{await validateProcedure(id,estado); await load()}catch{alert('No se pudo actualizar')}}
 return <AppShell><div className="mb-4"><h2 className="text-2xl font-bold">Pendientes de validación</h2><p className="text-sm text-white/50">Procedimientos registrados por becados.</p></div>{msg&&<p className="mb-4 rounded-2xl bg-white/10 p-3 text-sm text-white/70">{msg}</p>}{items.length===0&&!msg&&<p className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/70">No hay procedimientos pendientes.</p>}{items.map(p=><article key={p.id} className="mb-4 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5"><p className="text-xs font-bold uppercase tracking-wide text-amber-200">Pendiente</p><h3 className="mt-1 text-xl font-bold">{p.procedimiento}</h3><p className="text-sm text-white/60">{p.becado?.nombre} {p.becado?.apellido}</p><div className="mt-4 rounded-2xl bg-black/20 p-4 text-sm text-white/70"><p>Iniciales: {p.iniciales_paciente}</p><p>Contexto: {p.patologia_contexto}</p><p>Dificultad: {p.dificultad?'Sí':'No'}</p><p>Exitoso: {p.exitoso?'Sí':'No'}</p><p>Complicaciones: {p.complicaciones?'Sí':'No'}</p></div><div className="mt-4 grid grid-cols-3 gap-2"><button onClick={()=>act(p.id,'validado')} className="rounded-2xl bg-emerald-400 py-3 font-bold text-slate-950">Validar</button><button onClick={()=>act(p.id,'rechazado')} className="rounded-2xl bg-rose-400 py-3 font-bold text-slate-950">Rechazar</button><button onClick={()=>act(p.id,'correccion_solicitada')} className="rounded-2xl bg-amber-300 py-3 font-bold text-slate-950">Corregir</button></div></article>)}</AppShell>
}
