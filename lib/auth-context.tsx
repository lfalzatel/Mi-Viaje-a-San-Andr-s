'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type UserRole = 'admin' | 'user' | null

interface AuthContextType {
    user: User | null
    role: UserRole
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<UserRole>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Verificar sesión activa al cargar
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            handleUser(session?.user ?? null)
            setIsLoading(false)
        }

        checkUser()

        // Escuchar cambios en la autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleUser = (user: User | null) => {
        setUser(user)
        if (user) {
            // Asumimos que el rol está guardado en user_metadata o app_metadata
            const userRole = (user.user_metadata?.role || 'user') as UserRole
            setRole(userRole)

            if (pathname === '/login') {
                router.push('/')
            }
        } else {
            setRole(null)
            if (pathname !== '/login') {
                router.push('/login')
            }
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, role, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
