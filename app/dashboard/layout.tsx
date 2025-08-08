import type React from "react"
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import { NavigationProvider } from "@/components/layout/navigation-context"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import LayoutContent from "@/components/layout/layout-content"
import { Footer } from '@/components/layout/footer'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <NavigationProvider>
        <div className="flex flex-col min-h-screen">
          <LayoutContent>{children}</LayoutContent>
          <Footer />
        </div>
      </NavigationProvider>
    </SidebarProvider>
  )
} 