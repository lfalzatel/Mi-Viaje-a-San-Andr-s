'use client'

import { useAuth } from '@/lib/auth-context'
import { User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function UserProfileButton() {
    const { user, role } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (!user) return null

    // Extract user info
    const avatarUrl = user.user_metadata?.avatar_url
    const userName = user.email?.split('@')[0] || 'Usuario'
    const displayRole = role === 'admin' ? 'Administrador' : 'Viajero'

    return (
        <div className="flex items-center gap-3">
            {/* Profile Info */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white shadow-sm">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={userName}
                        className="w-6 h-6 rounded-full object-cover border-2 border-white/50"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                        <User size={14} />
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tighter leading-none opacity-70 mb-0.5">
                        {displayRole}
                    </span>
                    <span className="text-xs font-bold leading-none">{userName}</span>
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="p-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-white/40 transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="Cerrar Sesión"
            >
                <LogOut size={20} />
            </button>
        </div>
    )
}
