'use client'

import Link from 'next/link'
import { Calendar, DollarSign, MapPin, Package } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function Navigation() {
    const { role, logout } = useAuth()

    // No mostrar navegación en login
    if (!role) return null

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
            <div className="glass rounded-full p-2 shadow-tropical border border-white/20 flex items-center justify-around">
                <Link href="/itinerario" className="p-2 text-caribbean-600 hover:text-caribbean-800 transition-all hover:bg-white/40 rounded-full flex flex-col items-center gap-1 min-w-[60px]">
                    <Calendar size={20} />
                    <span className="text-[10px] font-bold">Plan</span>
                </Link>
                <Link href="/presupuesto" className="p-2 text-caribbean-600 hover:text-caribbean-800 transition-all hover:bg-white/40 rounded-full flex flex-col items-center gap-1 min-w-[60px]">
                    <DollarSign size={20} />
                    <span className="text-[10px] font-bold">Gastos</span>
                </Link>
                <Link href="/lugares" className="p-2 text-caribbean-600 hover:text-caribbean-800 transition-all hover:bg-white/40 rounded-full flex flex-col items-center gap-1 min-w-[60px]">
                    <MapPin size={20} />
                    <span className="text-[10px] font-bold">Lugares</span>
                </Link>
                <Link href="/equipaje" className="p-2 text-caribbean-600 hover:text-caribbean-800 transition-all hover:bg-white/40 rounded-full flex flex-col items-center gap-1 min-w-[60px]">
                    <Package size={20} />
                    <span className="text-[10px] font-bold">Maleta</span>
                </Link>
                <button
                    onClick={logout}
                    className="p-2 text-gray-500 hover:text-red-500 transition-all hover:bg-red-50 rounded-full flex flex-col items-center gap-1 min-w-[60px]"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-[10px] font-bold">Salir</span>
                </button>
            </div>
        </nav>
    )
}
