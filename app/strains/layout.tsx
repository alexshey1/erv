import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import { NavigationProvider } from '@/components/layout/navigation-context';
import { SidebarProvider } from '@/components/layout/sidebar-context';
import { Footer } from '@/components/layout/footer';
import React from 'react';

export default function StrainsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <NavigationProvider>
        <div className="flex h-screen flex-col">
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex-1 flex flex-col transition-all duration-300">
              <Topbar />
              <main className="flex-1 bg-gray-50 pt-16 p-4">{children}</main>
            </div>
          </div>
          <Footer />
        </div>
      </NavigationProvider>
    </SidebarProvider>
  );
} 