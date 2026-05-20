'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import { getCurrentUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'

export default function AdminPage() {
  const [profile, setProfile] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'becado',
  })

  async function load() {
    try {
      const me = await getCurrentUserProfile()
      setProfile(me)

      if (me?.rol !== 'administrador') {
        return
      }

      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .order('apellido')

      setUsers(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function createUser(event: React.FormEvent) {
    event.preventDefault()
    setCreating(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || 'No se pudo crear el usuario.')
        return
      }

      setMessage('Usuario creado correctamente.')

      setForm({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol: 'becado',
      })

      await load()
    } catch (error) {
      setMessage('Error inesperado al crear usuario.')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p>Cargando...</p>
      </AppShell>
    )
  }

  if (profile?.rol !== 'administrador') {
    return (
      <AppShell>
        <p>No autorizado.</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-3xl font-bold">
          Panel administrador
        </h1>

        <p className="text-sm text-white/60">
          Gestión de usuarios BK2HGF
        </p>
      </div>

      <form
        onSubmit={createUser}
        className="mb-6 space-y-3 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4"
      >
        <h2 className="text-xl font-bold">
          Crear nuevo usuario
        </h2>

        <input
          value={form.nombre}
          onChange={(e) =>
            setForm({ ...form, nombre: e.target.value })
          }
          placeholder="Nombre"
          className="w-full rounded-2xl border border-white/10 bg-[#0c1921] p-3 text-white outline-none"
          required
        />

        <input
          value={form.apellido}
          onChange={(e) =>
            setForm({ ...form, apellido: e.target.value })
          }
          placeholder="Apellido"
          className="w-full rounded-2xl border border-white/10 bg-[#0c1921] p-3 text-white outline-none"
          required
        />

        <input
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          placeholder="Correo"
          type="email"
          className="w-full rounded-2xl border border-white/10 bg-[#0c1921] p-3 text-white outline-none"
          required
        />

        <input
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          placeholder="Contraseña temporal"
          type="password"
          className="w-full rounded-2xl border border-white/10 bg-[#0c1921] p-3 text-white outline-none"
          required
        />

        <select
          value={form.rol}
          onChange={(e) =>
            setForm({ ...form, rol: e.target.value })
          }
          className="w-full rounded-2xl border border-white/10 bg-[#0c1921] p-3 text-white outline-none"
        >
          <option value="becado">Becado</option>
          <option value="docente">Docente</option>
        </select>

        {message && (
          <p className="rounded-2xl bg-white/10 p-3 text-sm text-white/80">
            {message}
          </p>
        )}

        <button
          disabled={creating}
          className="w-full rounded-2xl bg-emerald-400 py-3 font-bold text-slate-950 disabled:opacity-50"
        >
          {creating ? 'Creando...' : 'Crear usuario'}
        </button>
      </form>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Usuarios registrados
        </h2>

        <span className="text-sm text-white/50">
          {users.length} usuarios
        </span>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-3xl border border-white/10 bg-white/[0.05] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {user.nombre} {user.apellido}
                </p>

                <p className="text-sm text-white/60">
                  {user.email}
                </p>
              </div>

              <div
                className={`rounded-2xl px-3 py-1 text-sm ${
                  user.rol === 'administrador'
                    ? 'bg-amber-400/20 text-amber-200'
                    : user.rol === 'docente'
                    ? 'bg-cyan-400/20 text-cyan-200'
                    : 'bg-emerald-400/20 text-emerald-200'
                }`}
              >
                {user.rol}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}