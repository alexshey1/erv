"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { NavigationProvider } from "@/components/layout/navigation-context";
import { SidebarProvider, useSidebarContext } from "@/components/layout/sidebar-context";
import { Footer } from "@/components/layout/footer";
import React from "react";

interface AnomaliesLayoutWrapperProps {
  children: React.ReactNode;
}

function AnomaliesLayoutInner({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, isMounted } = useSidebarContext();
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${isMounted && sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}
        >
          <Topbar />
          <main className="flex-1 bg-gray-50 pt-16 p-4">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function AnomaliesLayoutWrapper({ children }: AnomaliesLayoutWrapperProps) {
  if (!children) {
    console.error("Propriedade 'children' está indefinida.");
    return <div>Erro ao carregar o layout.</div>;
  }

  return (
    <SidebarProvider>
      <NavigationProvider>
        <AnomaliesLayoutInner>{children}</AnomaliesLayoutInner>
      </NavigationProvider>
    </SidebarProvider>
  );
}
