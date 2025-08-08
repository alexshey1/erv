"use client"
import { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  sidebarOpen: boolean
  isMounted: boolean // Adicionado para controle de hidratação
  toggleSidebar: () => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Manter aberta por padrão no SSR
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Define o estado inicial com base no tamanho da tela (aberta para desktop)
    const mediaQuery = window.matchMedia("(min-width: 768px)")
    setSidebarOpen(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)
  
  const closeSidebar = () => {
    // Fecha a sidebar apenas se estiver em modo mobile
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarOpen(false)
    }
  }

  return (
    <SidebarContext.Provider value={{ sidebarOpen, isMounted, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebarContext must be used within SidebarProvider")
  return ctx
} 