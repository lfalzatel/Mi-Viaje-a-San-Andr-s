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
    const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
    const [message, setMessage] = useState<string | null>(null)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            if (mode === 'reset') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/login?mode=update-password`,
                })
                if (error) throw error
                setMessage('Se ha enviado un enlace de recuperación a tu correo.')
                return
            }

            const { error } = mode === 'login'
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: 'user'
                        }
                    }
                })

            if (error) throw error

            if (mode === 'signup') {
                setMessage('¡Cuenta creada! Ya puedes iniciar sesión.')
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
                        {mode === 'login' ? 'Inicia sesión para entrar a la aventura' :
                            mode === 'signup' ? 'Crea tu cuenta de viajero' :
                                'Recuperar acceso'}
                    </p>

                    <form onSubmit={handleAuth} className="space-y-4 mb-8">
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
                        {mode !== 'reset' && (
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
                        )}

                        {mode === 'login' && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setMode('reset')}
                                    className="text-[10px] text-caribbean-100 hover:text-white font-bold uppercase tracking-tighter transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}

                        {error && (
                            <p className="text-[10px] bg-red-500/20 text-red-100 p-2 rounded-lg border border-red-500/30 font-bold uppercase tracking-wider">
                                {error}
                            </p>
                        )}

                        {message && (
                            <p className="text-[10px] bg-green-500/20 text-green-100 p-2 rounded-lg border border-green-500/30 font-bold uppercase tracking-wider">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> :
                                (mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Registrarse' : 'Enviar Enlace')}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>


                    <p className="mt-8 text-center flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setError(null)
                                setMessage(null)
                                setMode(mode === 'login' ? 'signup' : 'login')
                            }}
                            className="text-caribbean-50 text-xs font-bold hover:text-white transition-colors underline decoration-coral-400 underline-offset-4"
                        >
                            {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>

                        {mode === 'reset' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setError(null)
                                    setMessage(null)
                                    setMode('login')
                                }}
                                className="text-caribbean-100 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Volver al login
                            </button>
                        )}
                    </p>
                </div>

                <p className="text-white/60 text-sm font-medium animate-fade-in text-center" style={{ animationDelay: '0.5s' }}>
                    By Antigravity AI • San Andrés 2026
                </p>
            </div>
        </main>
    )
}
