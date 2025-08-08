"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

function TopbarInstitucional() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="w-full bg-white border-b shadow-sm py-2 px-4 flex items-center justify-between">
      <Link href="/">
        <Image src="/ervapp-logo.png" alt="ErvApp" width={120} height={40} className="h-8 w-auto" />
      </Link>
      <nav className="hidden md:flex items-center space-x-8">
        <Link href="/sobre" className="text-gray-600 hover:text-green-500 transition-colors font-medium">Sobre Nós</Link>
        <Link href="/ajuda" className="text-gray-600 hover:text-green-500 transition-colors font-medium">Ajuda</Link>
        <Link href="/privacy" className="text-gray-600 hover:text-green-500 transition-colors font-medium">Privacidade</Link>
        <Link href="/terms" className="text-gray-600 hover:text-green-500 transition-colors font-medium">Termos</Link>
        <Link href="/help" className="text-gray-600 hover:text-green-500 transition-colors font-medium">FAQ</Link>
      </nav>
      <div className="hidden md:flex items-center space-x-4">
        <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium" onClick={() => router.push("/auth/login")}>Login</Button>
        <Button className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={() => router.push("/auth/register")}>Começar Agora<ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
      <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
        {mobileMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
      </button>
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-t shadow z-50">
          <nav className="flex flex-col space-y-4 p-4">
            <Link href="/sobre" className="text-gray-600 hover:text-green-500 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Sobre Nós</Link>
            <Link href="/ajuda" className="text-gray-600 hover:text-green-500 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Ajuda</Link>
            <Link href="/privacy" className="text-gray-600 hover:text-green-500 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Privacidade</Link>
            <Link href="/terms" className="text-gray-600 hover:text-green-500 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Termos</Link>
            <Link href="/help" className="text-gray-600 hover:text-green-500 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
              <Button variant="ghost" className="justify-start text-gray-600 hover:text-gray-900 font-medium" onClick={() => { setMobileMenuOpen(false); router.push("/auth/login") }}>Login</Button>
              <Button className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold" onClick={() => { setMobileMenuOpen(false); router.push("/auth/register") }}>Começar Agora<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default function InstitucionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      <TopbarInstitucional />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 