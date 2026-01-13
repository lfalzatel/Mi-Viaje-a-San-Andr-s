'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type UserRole = 'admin' | 'user' | null

interface AuthContextType {
    role: UserRole
    login: (role: UserRole) => void
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<UserRole>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Verificar si hay una sesión guardada
        const savedRole = localStorage.getItem('user_role') as UserRole
        if (savedRole) {
            setRole(savedRole)
        } else if (pathname !== '/login') {
            // Si no hay sesión y no estamos en login, redirigir
            router.push('/login')
        }
        setIsLoading(false)
    }, [pathname, router])

    const login = (newRole: UserRole) => {
        setRole(newRole)
        if (newRole) {
            localStorage.setItem('user_role', newRole)
        }
    }

    const logout = () => {
        setRole(null)
        localStorage.removeItem('user_role')
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ role, login, logout, isLoading }}>
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
