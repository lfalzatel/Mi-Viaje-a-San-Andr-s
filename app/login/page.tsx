'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, ShieldCheck, Waves, Palmtree, ArrowRight, Mail, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'login' | 'signup'>('login')

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = mode === 'login'
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: 'user' // Por defecto todo registro es usuario
                        }
                    }
                })

            if (error) throw error

            if (mode === 'signup') {
                alert('¡Cuenta creada! Revisa tu correo o intenta iniciar sesión.')
                setMode('login')
            } else {
                router.push('/itinerario')
            }
        } catch (err: any) {
            setError(err.message || 'Error al autenticar')
        } finally {
            setLoading(false)
        }
    }

    const quickLogin = async (role: 'admin' | 'user') => {
        setLoading(true)
        setError(null)
        // Usar credenciales por defecto si existen, o simplemente avisar
        const testEmail = role === 'admin' ? 'admin@viajesanandres.com' : 'viajero@viajesanandres.com'
        const testPass = '123456' // Password genérico para prueba

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPass
            })
            if (error) throw error
            router.push('/itinerario')
        } catch (err: any) {
            setError(`No se pudo usar el acceso rápido. Por favor usa tu propio correo. (${err.message})`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-caribbean-400 via-caribbean-500 to-caribbean-700 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'var(--wave-pattern)' }}></div>
            <div className="absolute -top-10 -right-10 text-white/10 animate-float pointer-events-none">
                <Palmtree size={200} />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="animate-slide-up bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[3rem] shadow-tropical mb-8">
                    <h1 className="font-display text-4xl font-bold text-white mb-2 tracking-tight text-center">
                        ¡Hola Viajero! 🌴
                    </h1>
                    <p className="text-caribbean-50 font-medium mb-8 text-center">
                        {mode === 'login' ? 'Inicia sesión para entrar a la aventura' : 'Crea tu cuenta de viajero'}
                    </p>

                    <form onSubmit={handleEmailLogin} className="space-y-4 mb-8">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-caribbean-200" size={18} />
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-caribbean-100 focus:outline-none focus:ring-2 focus:ring-coral-400 transition-all font-medium"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-caribbean-200" size={18} />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-caribbean-100 focus:outline-none focus:ring-2 focus:ring-coral-400 transition-all font-medium"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-[10px] bg-red-500/20 text-red-100 p-2 rounded-lg border border-red-500/30 font-bold uppercase tracking-wider">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (mode === 'login' ? 'Entrar' : 'Registrarse')}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-white/20 flex-1"></div>
                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">O acceso rápido</span>
                        <div className="h-px bg-white/20 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => quickLogin('admin')} className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl transition-all group">
                            <ShieldCheck className="text-coral-400 mx-auto mb-1 group-hover:scale-110 transition-transform" size={24} />
                            <p className="text-white text-[10px] font-black uppercase tracking-tighter">Admin</p>
                        </button>
                        <button onClick={() => quickLogin('user')} className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl transition-all group">
                            <User className="text-caribbean-400 mx-auto mb-1 group-hover:scale-110 transition-transform" size={24} />
                            <p className="text-white text-[10px] font-black uppercase tracking-tighter">Viajero</p>
                        </button>
                    </div>

                    <p className="mt-8 text-center">
                        <button
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-caribbean-50 text-xs font-bold hover:text-white transition-colors underline decoration-coral-400 underline-offset-4"
                        >
                            {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </p>
                </div>

                <p className="text-white/60 text-sm font-medium animate-fade-in text-center" style={{ animationDelay: '0.5s' }}>
                    By Antigravity AI • San Andrés 2026
                </p>
            </div>
        </main>
    )
}
