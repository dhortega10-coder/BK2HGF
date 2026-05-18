'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ClipboardCheck, Home, LineChart, Plus, Stethoscope, User } from 'lucide-react'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const nav = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/nuevo', label: 'Nuevo', icon: Plus },
    { href: '/validar', label: 'Validar', icon: ClipboardCheck },
    { href: '/dashboard', label: 'Panel', icon: LineChart },
    { href: '/historial', label: 'Perfil', icon: User },
  ]
  return (
    <div className="min-h-screen bg-[#071014] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col border-x border-white/10 bg-gradient-to-b from-[#071014] via-[#0a1820] to-[#05080b] shadow-2xl">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#071014]/90 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 shadow-lg shadow-cyan-500/10">
                <Stethoscope className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">BK2HGF</h1>
                <p className="text-xs text-cyan-100/60">Procedimientos · Urgencia</p>
              </div>
            </div>
            <Link href="/login" className="relative rounded-2xl border border-white/10 bg-white/5 p-2">
              <Bell className="h-5 w-5 text-cyan-100" />
            </Link>
          </div>
        </header>
        <main className="flex-1 px-5 pb-24 pt-5">{children}</main>
        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-white/10 bg-[#071014]/95 px-2 py-2 backdrop-blur-xl">
          <div className="grid grid-cols-5 gap-1">
            {nav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs transition ${isActive ? 'bg-cyan-500/20 text-cyan-200' : 'text-white/50 hover:bg-white/5'}`}>
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
