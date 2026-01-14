'use client'

import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

const routes = ['/itinerario', '/presupuesto', '/lugares', '/equipaje']

export default function SwipeLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { role } = useAuth()
    const [direction, setDirection] = useState(0)

    // Solo habilitar gestos si hay sesión iniciada y estamos en las páginas principales
    const isMainPage = routes.includes(pathname)
    if (!role || !isMainPage) return <>{children}</>

    const currentIndex = routes.indexOf(pathname)

    const onDragEnd = (event: any, info: any) => {
        const threshold = 100
        const velocity = 500

        if (info.offset.x > threshold || info.velocity.x > velocity) {
            // Swipe Right -> Go Left (Previous)
            if (currentIndex > 0) {
                setDirection(-1)
                router.push(routes[currentIndex - 1])
            }
        } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
            // Swipe Left -> Go Right (Next)
            if (currentIndex < routes.length - 1) {
                setDirection(1)
                router.push(routes[currentIndex + 1])
            }
        }
    }

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir > 0 ? '-100%' : '100%',
            opacity: 0,
        }),
    }

    return (
        <div className="relative overflow-hidden w-full min-h-screen">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                    key={pathname}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={onDragEnd}
                    className="w-full min-h-screen"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
