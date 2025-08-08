"use client"
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react"

interface NavigationContextType {
  activeSection: string
  setActiveSection: Dispatch<SetStateAction<string>>
}

const NavigationContext = createContext<NavigationContextType | null>(null)

interface NavigationProviderProps {
  children: ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [activeSection, setActiveSection] = useState("dashboard")
  return (
    <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) throw new Error("useNavigation must be used within NavigationProvider")
  return context
} 