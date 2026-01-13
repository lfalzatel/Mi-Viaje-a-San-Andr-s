'use client'

import Link from 'next/link'
import { MapPin, Calendar, DollarSign, Package, Waves, Palmtree, LogOut, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { user, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const features = [
    {
      icon: Calendar,
      title: 'Itinerario',
      description: 'Organiza tus actividades día a día',
      href: '/itinerario',
      gradient: 'from-caribbean-400 to-caribbean-600',
      delay: '0s'
    },
    {
      icon: DollarSign,
      title: 'Presupuesto',
      description: 'Controla tus gastos de viaje',
      href: '/presupuesto',
      gradient: 'from-coral-400 to-coral-600',
      delay: '0.1s'
    },
    {
      icon: MapPin,
      title: 'Lugares',
      description: 'Sitios imperdibles para visitar',
      href: '/lugares',
      gradient: 'from-sand-500 to-sand-700',
      delay: '0.2s'
    },
    {
      icon: Package,
      title: 'Equipaje',
      description: 'Checklist de qué empacar',
      href: '/equipaje',
      gradient: 'from-caribbean-300 to-coral-400',
      delay: '0.3s'
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header con olas animadas */}
      <div className="relative overflow-hidden bg-gradient-to-br from-caribbean-400 via-caribbean-500 to-caribbean-700 pt-16 pb-32">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'var(--wave-pattern)' }}></div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute top-10 right-10 text-white/20 animate-float">
          <Palmtree size={60} />
        </div>
        <div className="absolute bottom-20 left-10 text-white/20 animate-wave" style={{ animationDelay: '1s' }}>
          <Waves size={50} />
        </div>

        {/* User Profile & Logout */}
        <div className="absolute top-4 right-6 flex items-center gap-4 z-20">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white shadow-sm">
            <UserIcon size={16} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter leading-none opacity-70 mb-0.5">
                {role === 'admin' ? 'Administrador' : 'Viajero'}
              </span>
              <span className="text-xs font-bold leading-none">{user?.email?.split('@')[0]}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-white/40 transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="relative px-6 text-center">
          <div className="animate-slide-up">
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Mi Viaje a<br />
              <span className="text-sand-200 text-6xl md:text-7xl">San Andrés</span>
            </h1>
            <p className="font-body text-caribbean-50 text-lg md:text-xl max-w-md mx-auto">
              Tu paraíso caribeño te espera 🌴
            </p>
          </div>

          {/* Contador de días */}
          <div className="mt-8 animate-fade-in glass rounded-3xl inline-block px-8 py-4 shadow-tropical">
            <p className="text-caribbean-50 text-sm font-medium mb-1">Faltan</p>
            <p className="font-display text-4xl font-bold text-white">
              {Math.ceil((new Date('2025-07-01').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-caribbean-100 text-sm font-medium mt-1">días para la aventura</p>
          </div>
        </div>
      </div>

      {/* Grid de características */}
      <div className="px-6 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group"
                style={{ animationDelay: feature.delay }}
              >
                <div className="glass rounded-3xl p-6 shadow-tropical hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-caribbean-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-body text-caribbean-600">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-caribbean-500 font-medium group-hover:text-caribbean-600 transition-colors">
                    Ver más
                    <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Info rápida */}
      <div className="px-6 mt-12 max-w-4xl mx-auto">
        <div className="glass rounded-3xl p-6 shadow-tropical animate-fade-in">
          <h2 className="font-display text-2xl font-bold text-caribbean-800 mb-4 flex items-center">
            <span className="text-3xl mr-2">🏝️</span>
            Sobre San Andrés
          </h2>
          <div className="space-y-3 font-body text-caribbean-700">
            <p className="flex items-start">
              <span className="text-coral-500 mr-2">•</span>
              Mar de los 7 colores con aguas cristalinas
            </p>
            <p className="flex items-start">
              <span className="text-coral-500 mr-2">•</span>
              Clima tropical cálido todo el año (27-30°C)
            </p>
            <p className="flex items-start">
              <span className="text-coral-500 mr-2">•</span>
              Cultura raizal única con influencia afrocaribeña
            </p>
            <p className="flex items-start">
              <span className="text-coral-500 mr-2">•</span>
              Ideal para snorkel, buceo y deportes acuáticos
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
