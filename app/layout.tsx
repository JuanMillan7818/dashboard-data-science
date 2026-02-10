import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DataScope - Dashboard de Analisis',
  description: 'Dashboard interactivo para visualizacion y analisis exploratorio de datos con graficas de barras, boxplot y radar.',
}

export const viewport: Viewport = {
  themeColor: '#0a0f1c',
}

import { ReactQueryProvider } from "@/components/react-query-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className="font-sans antialiased">
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}
