"use client"
import { useState, useEffect } from "react"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { SimulatorContent } from "@/components/views/simulator-content"
import { PPFDCalculatorContent } from "@/components/views/ppfd-calculator-content"
import { CostsContent } from "@/components/views/costs-content"
import { ReportsContent } from "@/components/views/reports-content"
import { SettingsContent } from "@/components/views/settings-content"
import { ComparisonContent } from "@/components/views/comparison-content"
import { AnalyticsContent } from "@/components/views/analytics-content"
import { calculateResults } from "@/lib/cultivation-calculator"
import { HistoryContent } from "@/components/views/history-content"
import { AnomalyContent } from "@/components/views/anomaly-content"
import { Footer as FooterModern } from "@/components/layout/footer"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PermissionGuard } from '@/components/auth/permission-guard'
import { SmoothPageTransition, StaggerContainer, StaggerItem } from "@/components/ui/smooth-transitions"
import ErvaAppLanding from "./ErvaAppLanding"
import ErvinhoChatSuspense from "@/components/erva-bot-chat"
import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import { NavigationProvider } from "@/components/layout/navigation-context"
import { useSidebarContext } from "@/components/layout/sidebar-context"
import { useNavigation } from "@/components/layout/navigation-context"
import GlobalLoading from './loading'

function FooterOld() {
  return (
    <footer className="w-full bg-gradient-to-r from-green-50 via-white to-green-50 text-gray-600 text-center py-3 text-sm border-t border-green-100">
      &copy; 2025 ErvApp. Todos os direitos reservados.
    </footer>
  )
}

export default function MainApp() {
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()

  // hooks de estado SEMPRE no topo
  const [setupParams, setSetupParams] = useState({
    area_m2: 2.25,
    custo_equip_iluminacao: 2000,
    custo_tenda_estrutura: 1500,
    custo_ventilacao_exaustao: 800,
    custo_outros_equipamentos: 500,
  })
  const [cycleParams, setCycleParams] = useState({
    potencia_watts: 480,
    num_plantas: 6,
    producao_por_planta_g: 80,
    dias_vegetativo: 60,
    horas_luz_veg: 18,
    dias_floracao: 70,
    horas_luz_flor: 12,
    dias_secagem_cura: 20,
  })
  const [marketParams, setMarketParams] = useState({
    preco_kwh: 0.95,
    custo_sementes_clones: 500,
    custo_substrato: 120,
    custo_nutrientes: 350,
    custos_operacionais_misc: 100,
    preco_venda_por_grama: 45,
    preco_mercado_ilegal: 35,
  })
  const [results, setResults] = useState(calculateResults(setupParams, cycleParams, marketParams))

  useEffect(() => {
    fetch('/api/auth/supabase/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user || null)
        setCheckingAuth(false)
      })
      .catch(() => setCheckingAuth(false))
  }, [])

  useEffect(() => {
    setResults(calculateResults(setupParams, cycleParams, marketParams))
  }, [setupParams, cycleParams, marketParams])

  if (checkingAuth) return <GlobalLoading />;
  if (!user) return <ErvaAppLanding />;

  // Renderização condicional do app para usuários autenticados
  const AppLayout = () => {
    const { sidebarOpen, isMounted } = useSidebarContext();
    const { activeSection } = useNavigation();
    return (
      <div className="flex h-screen flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col transition-all duration-300" style={{ marginLeft: isMounted && sidebarOpen ? 256 : 0 }}>
            <Topbar />
            <main className="flex-1 pt-16 p-4">{renderContent(activeSection)}</main>
          </div>
        </div>
        <FooterModern />
      </div>
    );
  };

  // Ajustar renderContent para receber activeSection
  const renderContent = (activeSection: string) => {
    if (activeSection === "simulator") {
      return (
        <SimulatorContent 
          setupParams={setupParams}
          cycleParams={cycleParams}
          marketParams={marketParams}
          results={results}
          onSetupChange={setSetupParams}
          onCycleChange={setCycleParams}
          onMarketChange={setMarketParams}
        />
      )
    }
    if (activeSection === "ppfd-calculator") {
      return <PPFDCalculatorContent />
    }
    if (activeSection === "costs") {
      return <CostsContent setupParams={setupParams} results={{}} />
    }
    if (activeSection === "ervinho") {
      return (
        <div className="flex flex-col items-center py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-700 mb-2 text-center drop-shadow-lg">
            Ervinho - Seu assistente de cultivo da ErvApp
          </h1>
          <p className="text-green-900 text-base sm:text-lg mb-8 text-center max-w-xl">
            Tire dúvidas, peça dicas e receba orientações técnicas sobre cannabicultura com o Ervinho, o mestre cultivador digital da ErvApp.
          </p>
          <div className="w-full max-w-md">
            <ErvinhoChatSuspense />
          </div>
          <div className="mt-8 max-w-xl w-full">
            <div className="bg-orange-50 border border-orange-200 text-orange-900 p-4 rounded-xl shadow-sm text-sm flex items-center gap-2 font-sans">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-orange-600 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M6 21h12M6 21a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2M6 21l6-5.25L18 21" /></svg>
              <span>
                <strong className="uppercase font-bold">AVISO LEGAL:</strong> Este sistema é uma ferramenta educacional e de gestão agrícola. Os usuários são <span className="font-bold">100% responsáveis</span> por verificar e cumprir todas as leis locais, estaduais e federais aplicáveis. Os desenvolvedores não se responsabilizam pelo uso incorreto ou ilegal da ferramenta. As análises e recomendações são sugestões educacionais e não substituem consultoria profissional ou verificação legal.
              </span>
            </div>
          </div>
        </div>
      )
    }
    switch (activeSection) {
      case "dashboard":
        return (
          <PermissionGuard user={user} permission="canAccessDashboard">
            <DashboardContent results={results} cycleParams={cycleParams} user={user} />
          </PermissionGuard>
        )
      case "comparison":
        return (
          <PermissionGuard user={user} permission="canAccessComparison">
            <ComparisonContent setupParams={setupParams} cycleParams={cycleParams} marketParams={marketParams} />
          </PermissionGuard>
        )
      case "analytics":
        return (
          <PermissionGuard user={user} permission="canAccessAnalytics">
            <AnalyticsContent results={results} />
          </PermissionGuard>
        )
      case "reports":
        return (
          <PermissionGuard user={user} permission="canAccessReports">
            <ReportsContent setupParams={setupParams} cycleParams={cycleParams} marketParams={marketParams} />
          </PermissionGuard>
        )
      case "settings":
        return <SettingsContent user={user} />
      case "history":
        return (
          <PermissionGuard user={user} permission="canAccessHistory">
            <HistoryContent />
          </PermissionGuard>
        )
      case "anomalies":
        return (
          <PermissionGuard user={user} permission="canAccessAnomalies">
            <AnomalyContent />
          </PermissionGuard>
        )
      default:
        return (
          <PermissionGuard user={user} permission="canAccessDashboard">
            <DashboardContent results={results} cycleParams={cycleParams} user={user} />
          </PermissionGuard>
        )
    }
  }

  return (
    <SidebarProvider>
      <NavigationProvider>
        <AppLayout />
      </NavigationProvider>
    </SidebarProvider>
  );
}
