import type { Metadata } from 'next'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import './globals.css'
import Link from 'next/link'
import { Calendar, DollarSign, MapPin, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mi Viaje a San Andrés 🌴',
  description: 'Planificador de viaje a San Andrés, Isla del Caribe',
  manifest: '/manifest.json',
  themeColor: '#00a0e6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Viaje San Andrés',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-caribbean-50">
        <div className="pb-24">
          {children}
        </div>

        {/* Navigation Bar */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
          <div className="glass rounded-full p-2 shadow-tropical border border-white/20 flex items-center justify-around">
            <Link href="/itinerario" className="p-3 text-caribbean-600 hover:text-caribbean-800 transition-all hover:bg-white/40 rounded-full flex flex-col items-center gap-1">
              <Calendar size={20} />
              <span className="text-[10px] font-bold">Itinerario</span>
            </Link>
            <Link href="/presupuesto" className="p-3 text-caribbean-600 hover:text-caribbean-800 transition-all hover:bg-white/40 rounded-full flex flex-col items-center gap-1">
              <DollarSign size={20} />
              <span className="text-[10px] font-bold">Gastos</span>
            </Link>
            <Link href="/lugares" className="p-3 text-caribbean-600 hover:text-caribbean-800 transition-all hover:bg-white/40 rounded-full flex flex-col items-center gap-1">
              <MapPin size={20} />
              <span className="text-[10px] font-bold">Lugares</span>
            </Link>
            <Link href="/equipaje" className="p-3 text-caribbean-600 hover:text-caribbean-800 transition-all hover:bg-white/40 rounded-full flex flex-col items-center gap-1">
              <Package size={20} />
              <span className="text-[10px] font-bold">Equipaje</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  )
}
