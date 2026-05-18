'use client'
import { useState } from 'react'
import { signInWithEmail } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  async function login(e: React.FormEvent) {
    e.preventDefault()
    try { await signInWithEmail(email, password); router.push('/') }
    catch { setMsg('No se pudo iniciar sesión. Revisa correo/clave o configuración Supabase.') }
  }
  return <main className="flex min-h-screen items-center justify-center bg-[#071014] p-5 text-white"><form onSubmit={login} className="w-full max-w-sm rounded-[2rem] border border-cyan-400/20 bg-white/[0.04] p-6"><h1 className="text-3xl font-bold">BK2HGF</h1><p className="mt-1 text-sm text-white/50">Registro docente de procedimientos</p><input className="mt-6 w-full rounded-2xl bg-[#0c1921] p-4" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} /><input className="mt-3 w-full rounded-2xl bg-[#0c1921] p-4" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} /><button className="mt-5 w-full rounded-2xl bg-cyan-400 py-4 font-bold text-slate-950">Ingresar</button>{msg && <p className="mt-4 text-sm text-rose-200">{msg}</p>}<p className="mt-6 text-center text-xs text-white/35">Medicina de Urgencia — HGF</p></form></main>
}
