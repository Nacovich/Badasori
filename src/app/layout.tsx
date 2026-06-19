import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PwaRegister } from '@/components/PwaRegister'

export const metadata: Metadata = {
  title: 'Barco Manager',
  description: 'Gestión del día a día de tu barco',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Barco Manager',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="h-full bg-slate-50 text-slate-900 antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  )
}
