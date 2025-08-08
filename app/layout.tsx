import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"
import GlobalLoading from "./loading"
import ConditionalSuspense from "@/components/layout/conditional-suspense"
import SimpleFallbackClient from "@/components/layout/simple-fallback"
import { AuthProvider } from "@/components/providers/auth-provider"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import ServiceWorkerRegistration from "@/components/service-worker-registration"
import PWASplashWrapper from "@/components/pwa-splash-wrapper"
import SonnerToaster from "@/components/providers/sonner-toaster"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: 'ErvApp - Sistema de Cultivo Inteligente',
    template: '%s | ErvApp'
  },
  description: 'Sistema completo para monitoramento e gestão de cultivo com inteligência artificial. Monitore suas plantas, analise tricomas e otimize sua colheita.',
  applicationName: 'ErvApp',
  authors: [{ name: 'ErvApp Team' }],
  generator: 'Next.js',
  keywords: ['cultivo', 'indoor', 'cannabis', 'monitoramento', 'inteligência artificial', 'tricomas', 'análise'],
  referrer: 'origin-when-cross-origin',
  creator: 'ErvApp',
  publisher: 'ErvApp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    title: 'ErvApp - Sistema de Cultivo Inteligente',
    description: 'Sistema completo para monitoramento e gestão de cultivo com inteligência artificial',
    siteName: 'ErvApp',
    images: [
      {
        url: '/PRINT1.png',
        width: 540,
        height: 720,
        alt: 'ErvApp Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ErvApp - Sistema de Cultivo Inteligente',
    description: 'Sistema completo para monitoramento e gestão de cultivo com inteligência artificial',
    images: ['/PRINT1.png'],
  },
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon.ico', type: 'image/x-icon', sizes: '32x32' },
    { rel: 'icon', url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    { rel: 'apple-touch-icon', url: '/cannabis11414267.png', sizes: '192x192' },
    { rel: 'mask-icon', url: '/cannabis11414267.png', color: '#10b981' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ErvApp',
    startupImage: [
      {
        url: '/cannabis11414267.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'ErvApp',
    'application-name': 'ErvApp',
    'msapplication-TileColor': '#10b981',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#10b981',
  },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#10b981',
    colorScheme: 'light dark',
  };
}

// Componente de fallback simples
function SimpleFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>

      <body className={inter.className}>
        <PWASplashWrapper>
          <ConditionalSuspense fallback={<SimpleFallbackClient />}>
          <AuthProvider>
              <ConditionalSuspense fallback={<GlobalLoading />}>
                {children}
              </ConditionalSuspense>
          </AuthProvider>
          </ConditionalSuspense>
        </PWASplashWrapper>
        <SonnerToaster />
        <ServiceWorkerRegistration />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
