"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Settings, User, Shield, Bell, Palette, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProfileForm } from "@/components/auth/profile-form"
import { PreferencesContent } from "@/components/views/preferences-content"
import SecurityPage from "@/app/security/page"
import NotificationsPage from "@/app/notifications/page"
import AppearancePage from "@/app/appearance/page"

interface SettingsDropdownProps {
  isOpen: boolean
}

export function SettingsDropdown({ isOpen }: SettingsDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [modal, setModal] = useState<null | "profile" | "preferences" | "security" | "notifications" | "appearance">(null)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  return (
    <div className="pt-0 pb-2 mt-auto bg-transparent">
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-full transition-all group relative text-muted-foreground hover:bg-green-100 hover:text-green-700 hover:scale-105 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            title={!isOpen ? "Configurações" : undefined}
            style={{ justifyContent: 'flex-start' }}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span>Configurações</span>}
            {/* Tooltip para quando fechado */}
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Configurações
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Configurações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setModal("preferences")}> <Settings className="h-4 w-4 mr-2" /> Preferências </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModal("security")}> <Shield className="h-4 w-4 mr-2" /> Segurança </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModal("notifications")}> <Bell className="h-4 w-4 mr-2" /> Notificações </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModal("appearance")}> <Palette className="h-4 w-4 mr-2" /> Aparência </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Modais para cada configuração */}
      <Dialog open={modal !== null} onOpenChange={() => setModal(null)}>
        {modal === "profile" ? (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="sr-only">Perfil do Usuário</DialogTitle>
            </DialogHeader>
            <ProfileForm user={null} />
          </DialogContent>
        ) : (
          <DialogContent className="max-w-2xl p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>
                {modal === "preferences" && "Preferências"}
                {modal === "security" && "Segurança"}
                {modal === "notifications" && "Notificações"}
                {modal === "appearance" && "Aparência"}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[80vh] px-6 pb-6 w-full">
              {modal === "preferences" && <PreferencesContent />}
              {modal === "security" && <SecurityPage />}
              {modal === "notifications" && <NotificationsPage />}
              {modal === "appearance" && <AppearancePage />}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
} 