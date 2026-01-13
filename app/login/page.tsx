'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, ShieldCheck, Waves, Palmtree, ArrowRight } from 'lucide-react'

export type UserRole = 'admin' | 'user'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState<UserRole | null>(null)

    const handleLogin = (role: UserRole) => {
        setLoading(role)

        // Simular un pequeño delay para el efecto visual
        setTimeout(() => {
            localStorage.setItem('user_role', role)
            router.push('/')
        }, 800)
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-caribbean-400 via-caribbean-500 to-caribbean-700 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'var(--wave-pattern)' }}></div>
            <div className="absolute -top-10 -right-10 text-white/10 animate-float pointer-events-none">
                <Palmtree size={200} />
            </div>
            <div className="absolute -bottom-20 -left-10 text-white/5 animate-wave pointer-events-none" style={{ animationDelay: '1s' }}>
                <Waves size={300} />
            </div>

            <div className="w-full max-w-md relative z-10 text-center">
                <div className="animate-slide-up bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[3rem] shadow-tropical mb-8">
                    <h1 className="font-display text-4xl font-bold text-white mb-2 tracking-tight">
                        ¡Hola Viajero! 🌴
                    </h1>
                    <p className="text-caribbean-50 font-medium mb-8">
                        Selecciona tu perfil para entrar a la aventura
                    </p>

                    <div className="space-y-4">
                        {/* Tarjeta Administrador */}
                        <button
                            onClick={() => handleLogin('admin')}
                            disabled={!!loading}
                            className={`w-full group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${loading === 'admin' ? 'scale-95 opacity-50' : ''
                                }`}
                        >
                            <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg border-2 border-transparent group-hover:border-coral-400 transition-colors">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center shadow-md">
                                    <ShieldCheck className="text-white" size={28} />
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="font-display font-bold text-gray-800 text-lg">Administrador</h3>
                                    <p className="text-xs text-gray-500 font-medium">Acceso total para editar y borrar</p>
                                    <p className="text-[10px] text-coral-500 mt-1 font-bold">admin@viajesanandres.com</p>
                                </div>
                                <ArrowRight className="text-coral-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                            {loading === 'admin' && (
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                    <div className="w-6 h-6 border-3 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>

                        {/* Tarjeta Usuario */}
                        <button
                            onClick={() => handleLogin('user')}
                            disabled={!!loading}
                            className={`w-full group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${loading === 'user' ? 'scale-95 opacity-50' : ''
                                }`}
                        >
                            <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg border-2 border-transparent group-hover:border-caribbean-400 transition-colors">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-caribbean-400 to-caribbean-600 flex items-center justify-center shadow-md">
                                    <User className="text-white" size={28} />
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="font-display font-bold text-gray-800 text-lg">Viajero</h3>
                                    <p className="text-xs text-gray-500 font-medium">Solo lectura (no puede editar)</p>
                                    <p className="text-[10px] text-caribbean-500 mt-1 font-bold">viajero@viajesanandres.com</p>
                                </div>
                                <ArrowRight className="text-caribbean-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                            {loading === 'user' && (
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                    <div className="w-6 h-6 border-3 border-caribbean-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                <p className="text-white/60 text-sm font-medium animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    By Antigravity AI • San Andrés 2026
                </p>
            </div>
        </main>
    )
}
