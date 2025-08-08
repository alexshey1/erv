"use client"

import { useState } from "react"
import { Menu, X, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebarContext } from "./sidebar-context"
import Image from "next/image"
import { useAuthContext } from "@/components/providers/auth-provider"

export function MobileHeader() {
  const { sidebarOpen, toggleSidebar } = useSidebarContext()
  const { user } = useAuthContext()

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-10 w-10 hover:bg-emerald-50"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5 text-gray-700" />
          ) : (
            <Menu className="h-5 w-5 text-gray-700" />
          )}
        </Button>

        {/* Logo */}
        <div className="flex items-center">
          <Image 
            src="/ervapplogo.png" 
            alt="ErvApp" 
            width={32} 
            height={32} 
            className="rounded-full h-auto"
          />
          <span className="ml-2 text-lg font-bold text-gray-900">ErvApp</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-emerald-50">
            <Bell className="h-5 w-5 text-gray-700" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-emerald-50">
            <User className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      </div>
    </header>
  )
}