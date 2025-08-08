"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Gauge,
  Cpu,
  ChartBar,
  BookOpen,
  Leaf,
  BellRinging,
  Robot,
  Gear,
  Lock,
  SlidersHorizontal,
  ShieldCheck,
  Question,
  Image as IconImage
} from "phosphor-react"
import { Microscope } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { canAccess } from "@/lib/permissions-supabase"
import { UpgradeModal } from "@/components/auth/upgrade-modal"
import { SettingsDropdown } from "./settings-dropdown"
import Link from "next/link"
import { useNavigation } from "./navigation-context"
import Image from "next/image"
import { useSidebarContext } from "./sidebar-context"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import React from "react"
import { usePathname } from 'next/navigation';
import { useAuthContext } from "@/components/providers/auth-provider";

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  user?: any // user autenticado ou null
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: Gauge },
  { id: "simulator", name: "Simulador", icon: Cpu },
  { id: "reports", name: "Relatórios", icon: ChartBar },
  { id: "history", name: "Diário de Cultivo", icon: BookOpen },
  { id: "strains", name: "Biblioteca de Genéticas", icon: Leaf },
  { id: "anomalies", name: "Alertas IA", icon: BellRinging },
  { id: "visual-analysis-openrouter", name: "Análise Visual IA", icon: IconImage },
  { id: "trichome-analysis", name: "Análise de Tricomas", icon: Microscope },
  { id: "ervinho", name: "Ervinho - Assistente", icon: Robot },
]

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useSidebarContext();
  const { user, loading } = useAuthContext();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requiredPermission, setRequiredPermission] = useState<string | null>(null);

  // Remover o useEffect que fazia fetch do usuário

  if (loading || user === null) {
    return (
      <aside className="w-64 bg-gradient-to-b from-emerald-50/80 via-green-50/60 to-emerald-100/80 backdrop-blur-xl border-r border-emerald-200/30 text-gray-700 flex flex-col h-screen fixed left-0 top-0 z-30 px-4 transition-transform duration-300 shadow-xl shadow-emerald-500/10">
        <div className="flex items-center justify-center h-20 px-2">
          <div className="w-24 h-12 bg-emerald-200/50 rounded-xl animate-pulse backdrop-blur-sm" />
        </div>
        <nav className="flex-1 flex flex-col gap-6 mt-2">
          <div className="space-y-2 mt-8 px-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-emerald-200/40 rounded-lg w-5/6 mx-auto animate-pulse backdrop-blur-sm" />
            ))}
          </div>
        </nav>
      </aside>
    );
  }

  // Mapear id para rota fixa
  const routeMap: Record<string, string> = {
    dashboard: '/dashboard',
    simulator: '/simulator',
    costs: '/costs',
    comparison: '/comparison',
    analytics: '/analytics',
    reports: '/reports',
    history: '/history',
    strains: '/strains',
    anomalies: '/anomalies',
    'visual-analysis-openrouter': '/visual-analysis-openrouter',
    'trichome-analysis': '/trichome-analysis',
    ervinho: '/ervinho',
  };

  // Define permissions for blocked items
  const permissionMap: Record<string, string> = {
    dashboard: "canAccessDashboard",
    simulator: "canAccessDashboard",
    reports: "canAccessReports",
    history: "canAccessHistory",
    strains: "canAccessDashboard",
    anomalies: "canAccessAnomalies",
    "visual-analysis-openrouter": "canUseVisualAnalysis",
    "trichome-analysis": "canUseVisualAnalysis",
    ervinho: "canAccessAnalytics",
  };

  return (
    <aside className={`w-64 bg-gradient-to-b from-emerald-50/80 via-green-50/60 to-emerald-100/80 backdrop-blur-xl border-r border-emerald-200/30 text-gray-700 flex flex-col h-screen fixed left-0 top-0 z-30 px-4 transition-transform duration-300 shadow-xl shadow-emerald-500/10 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-2">
        <Image 
          src="/ervapplogo.png" 
          alt="ErvApp Logo" 
          width={120} 
          height={120}
          className="rounded-full object-contain h-auto" 
        />
      </div>
      {/* Menu Section */}
      <nav className="flex-1 flex flex-col gap-6 mt-2">
        <div>
          <span className="text-xs text-emerald-700/80 font-semibold px-2 mb-3 block tracking-widest uppercase drop-shadow-sm">Menu</span>
          <ul className="flex flex-col gap-1">
            <TooltipProvider>
              {navigation.map(item => {
                const Icon = item.icon;
                const href = routeMap[item.id] || '/';
                const isActive = pathname === href;
                const isBlocked = user && permissionMap[item.id] && !canAccess(user, permissionMap[item.id] as any);
                return (
                  <li key={item.id}>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <a
                          href={isBlocked ? undefined : href}
                          onClick={e => {
                            if (isBlocked) {
                              e.preventDefault();
                              setRequiredPermission(permissionMap[item.id]);
                              setUpgradeModalOpen(true);
                            } else {
                              closeSidebar(); // Fecha a sidebar ao clicar
                            }
                          }}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl w-full text-left transition-all duration-200 group
                          ${isActive ? "bg-gradient-to-r from-emerald-500/90 to-green-500/90 backdrop-blur-sm text-white font-semibold shadow-lg shadow-emerald-500/30 border border-emerald-400/20" : "hover:bg-white/40 hover:backdrop-blur-md hover:shadow-md hover:border hover:border-emerald-200/40 text-gray-700 hover:text-gray-800"}
                          ${isBlocked ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                          tabIndex={isBlocked ? -1 : 0}
                          {...(isBlocked ? { 'aria-disabled': true } : {})}
                        >
                          {Icon ? <Icon size={20} weight="duotone" className={`transition-colors duration-200 ${isActive ? "text-white drop-shadow-sm" : "text-emerald-600 group-hover:text-emerald-700"}`} /> : <span className="w-5 h-5" />}
                          <span className={`text-sm font-medium transition-colors duration-200 ${isActive ? "text-white drop-shadow-sm" : ""}`}>{item.name}</span>
                          {isBlocked && <Lock size={16} className="ml-auto text-amber-600 drop-shadow-sm" />}
                        </a>
                      </TooltipTrigger>
                    </Tooltip>
                  </li>
                );
              })}
            </TooltipProvider>
          </ul>
        </div>
      </nav>
      {requiredPermission && (
        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          requiredPermission={requiredPermission}
        />
      )}
      {/* Botão de Configurações moderno */}
      <div className="mb-6 mt-auto border-t border-emerald-200/40 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-left transition-all duration-200 hover:bg-white/40 hover:backdrop-blur-md hover:shadow-md hover:border hover:border-emerald-200/40 text-gray-700 hover:text-gray-800 group"
              type="button"
            >
              <Gear className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-200" />
              <span className="text-sm font-medium">Configurações</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 ml-2 rounded-xl shadow-xl border border-emerald-200/40 p-2 bg-white/80 backdrop-blur-xl">
            <DropdownMenuItem className="flex items-center gap-3 rounded-lg hover:bg-emerald-50/80 hover:backdrop-blur-sm transition-all duration-200 px-3 py-2">
              <BellRinging className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">Notificações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-emerald-200/40" />
            <DropdownMenuItem className="flex items-center gap-3 rounded-lg hover:bg-emerald-50/80 hover:backdrop-blur-sm transition-all duration-200 px-3 py-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">Preferências</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-emerald-200/40" />
            <DropdownMenuItem className="flex items-center gap-3 rounded-lg hover:bg-emerald-50/80 hover:backdrop-blur-sm transition-all duration-200 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">Privacidade</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-emerald-200/40" />
            <DropdownMenuItem className="flex items-center gap-3 rounded-lg hover:bg-emerald-50/80 hover:backdrop-blur-sm transition-all duration-200 px-3 py-2">
              <Question className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">Ajuda</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
