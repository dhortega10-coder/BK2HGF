'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Activity, ClipboardCheck, Plus, LineChart, User } from 'lucide-react'
import { getCurrentUserProfile } from '@/lib/auth'

const feed = [
  ['✅', 'Intubación validada', 'Dra. Pérez realizó una intubación exitosa. ¡Buen avance!'],
  ['⭐', 'Nuevo hito docente', 'Dr. Soto alcanzó 20 procedimientos validados. Excelente progresión.'],
  ['📝', 'Pendiente de validación', 'Dra. Rojas registró una toracocentesis. Requiere revisión del tutor.'],
]

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentUserProfile()
        setProfile(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const isDocente =
    profile?.rol === 'docente' || profile?.rol === 'administrador'

  return (
    <AppShell>
      <section className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-blue-900/20 p-5 shadow-2xl shadow-cyan-500/10">
        <p className="mb-1 text-sm text-cyan-100/70">
          {loading
            ? 'Cargando perfil...'
            : profile
              ? `Bienvenido/a, ${profile.nombre} ${profile.apellido}`
              : 'Bienvenido/a'}
        </p>

        <h2 className="text-2xl font-bold leading-tight">
          Registro docente de procedimientos
        </h2>

        <p className="mt-2 text-sm text-white/60">
          {isDocente
            ? 'Vista docente: validación, dashboard y seguimiento de becados.'
            : 'Vista becado: registro rápido e historial personal.'}
        </p>

        <Link
          href="/nuevo"
          className="mt-5 flex w-full items-center justify-center rounded-2xl bg-cyan-400 py-4 text-base font-bold text-slate-950 hover:bg-cyan-300"
        >
          <Plus className="mr-2 h-5 w-5" /> Nuevo procedimiento
        </Link>
      </section>

      {isDocente && (
        <section className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/validar"
            className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4"
          >
            <div className="flex justify-between text-xs text-white/60">
              Pendientes <ClipboardCheck className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-bold">2</p>
            <p className="mt-1 text-xs text-amber-200">
              Validaciones docentes
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4"
          >
            <div className="flex justify-between text-xs text-white/60">
              Dashboard <LineChart className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-bold">17</p>
            <p className="mt-1 text-xs text-emerald-200">
              Procedimientos semana
            </p>
          </Link>
        </section>
      )}

      {!isDocente && (
        <section className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/historial"
            className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4"
          >
            <div className="flex justify-between text-xs text-white/60">
              Mi historial <User className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-bold">0</p>
            <p className="mt-1 text-xs text-cyan-200">Procedimientos</p>
          </Link>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="flex justify-between text-xs text-white/60">
              Semana <Activity className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-bold">0</p>
            <p className="mt-1 text-xs text-emerald-200">Actividad personal</p>
          </div>
        </section>
      )}

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">Feed docente</h3>
          <span className="text-xs text-white/40">Actividad reciente</span>
        </div>

        <div className="space-y-3">
          {feed.map(([icon, title, text]) => (
            <div
              key={title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex gap-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-white/65">{text}</p>
                  <p className="mt-2 text-xs text-white/35">
                    Hace pocos minutos
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  )
}