'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import {
  Activity,
  ClipboardCheck,
  Plus,
  LineChart,
  User,
} from 'lucide-react'

import { getCurrentUserProfile } from '@/lib/auth'
import { getFeed } from '@/lib/feed'
import { getHomeStats } from '@/lib/procedures'

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    pendientes: 0,
    semana: 0,
    personales: 0,
  })

  const [feed, setFeed] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getCurrentUserProfile()
        setProfile(data)

        if (data) {
          const docente =
            data.rol === 'docente' ||
            data.rol === 'administrador'

          const statsData = await getHomeStats(
            data.id,
            docente
          )

          setStats(statsData)
        }

        const feedData = await getFeed(20)
        setFeed(feedData || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const isDocente =
    profile?.rol === 'docente' ||
    profile?.rol === 'administrador'

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
          <Plus className="mr-2 h-5 w-5" />
          Nuevo procedimiento
        </Link>
      </section>

      {isDocente && (
        <section className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/validar"
            className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4"
          >
            <div className="flex justify-between text-xs text-white/60">
              Pendientes
              <ClipboardCheck className="h-4 w-4" />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {stats.pendientes}
            </p>

            <p className="mt-1 text-xs text-amber-200">
              Validaciones docentes
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4"
          >
            <div className="flex justify-between text-xs text-white/60">
              Dashboard
              <LineChart className="h-4 w-4" />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {stats.semana}
            </p>

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
              Mi historial
              <User className="h-4 w-4" />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {stats.personales}
            </p>

            <p className="mt-1 text-xs text-cyan-200">
              Procedimientos
            </p>
          </Link>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="flex justify-between text-xs text-white/60">
              Semana
              <Activity className="h-4 w-4" />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {stats.semana}
            </p>

            <p className="mt-1 text-xs text-emerald-200">
              Actividad personal
            </p>
          </div>
        </section>
      )}

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            Feed docente
          </h3>

          <span className="text-xs text-white/40">
            Actividad reciente
          </span>
        </div>

        <div className="space-y-3">
          {feed.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-white/60">
                Aún no hay actividad reciente.
              </p>
            </div>
          )}

          {feed.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex gap-3">
                <span className="text-xl">
                  {item.tipo_evento ===
                  'procedimiento_validado'
                    ? '✅'
                    : item.tipo_evento ===
                      'hito_becado'
                    ? '⭐'
                    : '📝'}
                </span>

                <div>
                  <p className="font-semibold">
                    {item.tipo_evento ===
                    'procedimiento_validado'
                      ? 'Procedimiento validado'
                      : item.tipo_evento ===
                        'hito_becado'
                      ? 'Nuevo hito docente'
                      : 'Nuevo registro'}
                  </p>

                  <p className="mt-1 text-sm text-white/65">
                    {item.mensaje}
                  </p>

                  <p className="mt-2 text-xs text-white/35">
                    {new Date(
                      item.fecha_creacion
                    ).toLocaleString('es-CL')}
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