"use client"
import Sidebar from "./sidebar"
import Topbar from "./topbar"
import { useSidebarContext } from "./sidebar-context"

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, isMounted } = useSidebarContext()
  return (
    <div className="flex">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col transition-all duration-300`}
        style={{ marginLeft: isMounted && sidebarOpen ? 256 : 0 }}
      >
        <Topbar />
        <main className="flex-1 bg-gray-50 pt-16 p-4">{children}</main>
      </div>
    </div>
  )
} 