import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  // ... existing metadata ...
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
        <AuthProvider>
          <div className="pb-32">
            {children}
          </div>
          <Navigation />
        </AuthProvider>
      </body>
    </html>
  )
}
