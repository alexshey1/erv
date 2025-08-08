"use client";

import { useEffect, useState } from "react";
import { Bell, Sun, Moon, LogOut, UserRound, Settings, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileForm } from "@/components/auth/profile-form";
import { useSidebarContext } from "./sidebar-context";
import { useAuthContext } from "@/components/providers/auth-provider";
import { NotificationBadge } from "@/components/notifications/notification-badge";

interface TopbarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  title?: string;
}

export default function Topbar() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toggleSidebar, sidebarOpen: contextSidebarOpen, isMounted } = useSidebarContext();

  const { user } = useAuthContext();

  return (
    <header
      className="h-16 flex items-center px-6 bg-white shadow fixed top-0 z-20 transition-all duration-300"
      style={{ 
        left: isMounted && contextSidebarOpen ? 256 : 0, 
        right: 0 
      }}
    >
      {/* Botão de menu no canto esquerdo */}
      <button
        className="mr-4 flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="Abrir menu de navegação"
        onClick={toggleSidebar}
        type="button"
      >
        <Menu className="h-6 w-6 text-gray-500" />
      </button>
      <div className="flex-1 flex items-center justify-end gap-4">
        {user && (
          <>
            {/* Badge de Notificações */}
            <NotificationBadge />
            
            <span className="hidden md:flex flex-col items-end mr-2">
              <span className="font-medium text-sm text-gray-800">{user.name}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.name || "Usuário"} />
                    <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border border-gray-200 p-1 bg-white">
                <DropdownMenuItem
                  className="flex items-center gap-2 rounded-lg hover:bg-green-50 transition-colors"
                  onClick={() => setShowProfileModal(true)}
                >
                  <UserRound className="h-5 w-5 text-green-600" /> Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 rounded-lg hover:bg-red-50 transition-colors text-red-600" onClick={async () => {
                  await fetch('/api/auth/supabase/logout', { method: 'POST' });
                  window.location.href = '/auth/login';
                }}>
                  <LogOut className="h-5 w-5" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Perfil do Usuário</DialogTitle>
                </DialogHeader>
                <ProfileForm user={user} />
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </header>
  );
}