"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Lock,
  MapPinOff,
  ShieldCheck,
  Bot,
  CircleDollarSign,
  LayoutDashboard,
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  Shield,
  Brain,
  Calculator,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Star,
  Play,
  BookOpen,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Calendar,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { motion } from "framer-motion"

type AuthButtonProps = {
  plan?: string;
  children: React.ReactNode;
};

function AuthButton({ plan, children }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await router.push(`/auth/register${plan ? `?plan=${plan}` : ""}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? "Carregando..." : children}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function ErvaAppLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 5)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const scrollToPlans = () => {
    const target = document.getElementById('precos')
    if (!target) return
    const headerEl = document.querySelector('header') as HTMLElement | null
    const headerHeight = headerEl?.offsetHeight ?? 0
    const computeY = () => target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12
    window.scrollTo({ top: computeY(), behavior: 'smooth' })
    setTimeout(() => {
      window.scrollTo({ top: computeY(), behavior: 'smooth' })
    }, 600)
  }

  const features = [
    {
      icon: LayoutDashboard,
      title: "Dashboard Inteligente",
      description: "Visualize todos os seus dados em tempo real",
      value: "Economize 5h/semana em análises",
    },
    {
      icon: Bot,
      title: "IA Preditiva",
      description: "Previna problemas antes que aconteçam",
      value: "Reduza perdas em até 40%",
    },
    {
      icon: CircleDollarSign,
      title: "ROI Automático",
      description: "Calcule lucros e custos automaticamente",
      value: "Aumente lucros em 25%",
    },
    {
      icon: TrendingUp,
      title: "Analytics Avançado",
      description: "Insights profundos sobre seu cultivo",
      value: "Melhore produtividade em 30%",
    },
    {
      icon: BookOpen,
      title: "Histórico com Timeline",
      description: "Registre cada momento com fotos e dados precisos",
      value: "Nunca mais perca informações importantes",
    },
  ]

  const stats = [
    { number: "10,000+", label: "Cultivadores Ativos" },
    { number: "2.5M+", label: "Plantas Monitoradas" },
    { number: "40%", label: "Redução de Perdas" },
    { number: "25%", label: "Aumento de Lucro" },
  ]

  const router = useRouter()

  // Planos
  const plans = [
    {
      name: "Grátis",
      plan: "free",
      price: 0,
      description: "Ideal para quem está começando.",
      features: [
        "Dashboard Inteligente",
        "Histórico de Cultivos",
        "Até 6 cultivos ativos",
        "Suporte básico",
      ],
      popular: false,
      color: "bg-green-100 text-green-700",
    },
    {
      name: "Básico",
      plan: "basic",
      price: 14.9,
      description: "Para quem quer mais controle.",
      features: [
        "Tudo do Grátis",
        "Analytics Avançado",
        "Relatórios Básicos",
        "Exportação de dados",
        "Até 20 cultivos ativos",
        "Suporte prioritário",
      ],
      popular: false,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Premium",
      plan: "premium",
      price: 34.9,
      description: "Recursos avançados e IA.",
      features: [
        "Tudo do Básico",
        "Alertas Inteligentes IA",
        "Relatórios Detalhados",
        "Até 50 cultivos ativos",
        "Suporte premium",
      ],
      popular: true,
      color: "bg-purple-100 text-purple-700",
    },
    {
      name: "Enterprise",
      plan: "enterprise",
      price: 119.9,
      description: "Para grandes operações.",
      features: [
        "Tudo do Premium",
        "Equipe e permissões",
        "API e integrações",
        "Cultivos ilimitados",
        "Suporte dedicado",
      ],
      popular: false,
      color: "bg-yellow-100 text-yellow-700",
    },
  ]

  // Conteúdo estático da seção Ervinho
  const ervinhoSectionTitle = "Conheça o Ervinho: Seu Assistente de Cultivo";
  const ervinhoSectionSubtitle =
    "O Ervinho é o assistente de chat inteligente da ErvApp, pronto para tirar dúvidas, dar dicas e acompanhar você em cada etapa do cultivo. Fale com ele a qualquer hora para receber orientações personalizadas, alertas e recomendações baseadas em IA.";
  const ervinhoSectionHighlights = [
    "Responde dúvidas sobre cultivo 24/7",
    "Sugestões automáticas para cada fase",
    "Alertas inteligentes e lembretes",
    "Aprende com seu histórico para personalizar dicas",
  ];

  return (
    <div className="min-h-screen bg-white font-inter overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/60 supports-[backdrop-filter]:bg-white/40 backdrop-blur-xl backdrop-saturate-150 shadow-sm">
        <div className="mx-auto w-full sm:container px-0 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 pr-4 sm:pr-6 lg:pr-8">
            {/* Logo */}
            <div className="flex items-center space-x-2 -ml-4 sm:ml-0 lg:-ml-3">
              <Image
                src="/ervapplog2o.png"
                alt="ErvApp Logo"
                width={160}
                height={48}
                className="h-10 sm:h-12 w-auto"
                priority={false}
                loading="lazy"
                quality={90}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/sobre" className="text-gray-600 hover:text-green-500 transition-colors font-medium">Sobre Nós</Link>
              <Link href="#funcionalidades" className="text-gray-600 hover:text-green-500 transition-colors font-medium">Funcionalidades</Link>
              <Link href="#seguranca" className="text-gray-600 hover:text-green-500 transition-colors font-medium">Segurança</Link>
              <Link href="#precos" className="text-gray-600 hover:text-green-500 transition-colors font-medium">Planos</Link>
              <Link href="#faq" className="text-gray-600 hover:text-green-500 transition-colors font-medium">FAQ</Link>
            </nav>
            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium" onClick={() => router.push("/auth/login")}>Login</Button>
              <Button className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={() => router.push("/auth/register")}>Começar Agora<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={toggleMobileMenu} aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
            </button>
          </div>
                      {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-white/20 bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur-xl py-4 rounded-b-xl shadow">
                <nav className="flex flex-col space-y-4">
                <Link href="/sobre" className="text-gray-600 hover:text-green-500 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Sobre Nós</Link>
                <Link href="#funcionalidades" className="text-gray-600 hover:text-green-500 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Funcionalidades</Link>
                <Link href="#seguranca" className="text-gray-600 hover:text-green-500 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Segurança</Link>
                <Link href="#precos" className="text-gray-600 hover:text-green-500 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Planos</Link>
                <Link href="#faq" className="text-gray-600 hover:text-green-500 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Button variant="ghost" className="justify-start text-gray-600 hover:text-gray-900 font-medium" onClick={() => { setMobileMenuOpen(false); router.push("/auth/login") }}>Login</Button>
                  <Button className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold" onClick={() => { setMobileMenuOpen(false); router.push("/auth/register") }}>Começar Agora<ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <Badge className="bg-green-100 text-green-700 border-green-200 mb-6 text-sm font-medium px-4 py-2">
                <span className="mr-2">🇧🇷</span>
                Tecnologia 100% Brasileira • Mais de 10.000 cultivadores
              </Badge>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Menos{" "}
                <motion.span
                  className="text-green-500 relative inline-block"
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 40, damping: 12, delay: 0.3, duration: 1.2 }}
                >
                  'achismo'
                  <div className="absolute -bottom-2 left-0 w-full h-3 bg-green-200 -z-10 transform -rotate-1"></div>
                </motion.span>
                , <motion.span
                  className="text-green-700 text-5xl sm:text-7xl font-bold inline-block align-baseline relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6, duration: 0.6, type: 'spring', stiffness: 60 }}
                >
                  mais colheita
                  <div className="absolute -bottom-2 left-0 w-full h-3 bg-green-700 -z-10 transform -rotate-1"></div>
                </motion.span>.
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
                O copiloto inteligente que{" "}
                <span className="font-semibold text-gray-800">transforma dados em resultados</span>, com a privacidade
                que você exige.
              </p>

              {/* Value Props */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Gestão fácil e centralizada</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">100% privado e seguro</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">IA preditiva avançada</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Insights automáticos</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => router.push("/auth/register")}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Começar Gratuitamente
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50 text-lg px-8 py-4 bg-transparent font-semibold"
                  onClick={scrollToPlans}
                >
                  Ver Planos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 font-medium">4.9/5 (2,847 avaliações)</span>
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="relative group">
                {/* Efeito neon/glow verde atrás do vídeo inteiro ao hover */}
                <span className="absolute inset-0 rounded-2xl blur-2xl bg-green-500 opacity-30 group-hover:opacity-45 group-hover:scale-105 transition-all duration-300 pointer-events-none z-0" />
                <Image
                  src="/mockup.png"
                  alt="Mockup do Histórico de Cultivo da ErvApp"
                  width={600}
                  height={400}
                  className="relative rounded-2xl shadow-2xl border border-green-100 w-full h-auto object-contain bg-green-50 z-10 transition-transform duration-300 group-hover:scale-105"
                  quality={90}
                  loading="lazy"
                  priority={false}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                {/* Badge de monitoramento em tempo real sem glow */}
                <div className="absolute bottom-4 right-4 z-20">
                  <div className="relative flex items-center">
                    <div className="relative flex items-center bg-white border border-green-400 rounded-xl px-4 py-2 shadow-lg">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2 shadow-green-400 shadow-md" />
                      <span className="text-green-700 font-semibold text-sm">Monitoramento em tempo real</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Destaque Pioneirismo Nacional - agora logo abaixo do hero */}
      <section className="w-full py-8 px-4 bg-gradient-to-br from-green-100 via-white to-green-50">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-300/90 text-green-900 font-bold text-base shadow border-2 border-green-600 mb-2 animate-pulse">
            🇧🇷 Orgulho Nacional
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-800 drop-shadow-lg leading-tight">
            O ErvApp é o <span className="text-green-700 underline underline-offset-4 decoration-yellow-400">primeiro software de gestão com IA integrada para cultivadores de cannabis</span> no Brasil!
          </h2>
          <p className="text-lg sm:text-xl text-green-900 font-medium max-w-2xl mx-auto mt-2">
            Feito por brasileiros, para brasileiros. Nossa missão é fortalecer a comunidade nacional de cultivadores, promovendo tecnologia, inteligência artificial, conhecimento e autonomia para o cultivo responsável e legal.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-200/90 text-green-900 font-bold text-base shadow border border-green-700">100% Brasileiro</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-200/90 text-blue-900 font-bold text-base shadow border border-blue-700">Pioneirismo Nacional</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-200/90 text-yellow-900 font-bold text-base shadow border border-yellow-700">Inteligência Artificial</span>
          </div>
          <p className="text-base text-green-800 mt-2 max-w-xl mx-auto">
            Junte-se à revolução verde e inteligente e faça parte da história do cultivo brasileiro!
          </p>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Principais Funcionalidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {/* Dashboard Inteligente */}
            <Card className="bg-gray-50 border-gray-200 w-full max-w-sm text-center transition-transform duration-300 hover:scale-105 hover:shadow-green-200 shadow-lg cursor-pointer">
              <CardHeader className="p-6 pb-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <LayoutDashboard className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">Dashboard Inteligente</CardTitle>
                <p className="text-gray-600">Visualize todos os dados do seu cultivo em tempo real, de forma simples e intuitiva.</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-green-600 font-semibold text-base">Economize tempo e tome decisões melhores</p>
              </CardContent>
            </Card>
            {/* IA Preditiva + Análise Visual */}
            <Card className="bg-gray-50 border-gray-200 w-full max-w-sm text-center transition-transform duration-300 hover:scale-105 hover:shadow-green-200 shadow-lg cursor-pointer">
              <CardHeader className="p-6 pb-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">IA Preditiva + Análise Visual</CardTitle>
                <p className="text-gray-600">Previna problemas antes que aconteçam e analise suas plantas por foto com IA avançada.</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-green-600 font-semibold text-base">Diagnóstico completo e prevenção inteligente</p>
              </CardContent>
            </Card>
            {/* Analytics Avançado */}
            <Card className="bg-gray-50 border-gray-200 w-full max-w-sm text-center transition-transform duration-300 hover:scale-105 hover:shadow-green-200 shadow-lg cursor-pointer">
              <CardHeader className="p-6 pb-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">Analytics Avançado</CardTitle>
                <p className="text-gray-600">Descubra insights profundos sobre produtividade, custos e oportunidades de melhoria.</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-green-600 font-semibold text-base">Melhore sua performance a cada ciclo</p>
              </CardContent>
            </Card>
            {/* Alertas Inteligentes (IA) */}
            <Card className="bg-gray-50 border-gray-200 w-full max-w-sm text-center transition-transform duration-300 hover:scale-105 hover:shadow-green-200 shadow-lg cursor-pointer">
              <CardHeader className="p-6 pb-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">Alertas Inteligentes</CardTitle>
                <p className="text-gray-600">Receba notificações automáticas de riscos no seu cultivo.</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-green-600 font-semibold text-base">Aja rápido e evite prejuízos</p>
              </CardContent>
            </Card>
            {/* Histórico com Timeline */}
            <Card className="bg-gray-50 border-gray-200 w-full max-w-sm text-center transition-transform duration-300 hover:scale-105 hover:shadow-green-200 shadow-lg cursor-pointer">
              <CardHeader className="p-6 pb-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">Diário de Cultivo com Timeline</CardTitle>
                <p className="text-gray-600">Registre cada etapa do cultivo com fotos, dados e eventos importantes.</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-green-600 font-semibold text-base">Nunca mais perca informações valiosas</p>
              </CardContent>
            </Card>
            {/* Exportação de Dados */}
            <Card className="bg-gray-50 border-gray-200 w-full max-w-sm text-center transition-transform duration-300 hover:scale-105 hover:shadow-green-200 shadow-lg cursor-pointer">
              <CardHeader className="p-6 pb-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">Exportação de Dados</CardTitle>
                <p className="text-gray-600">Exporte relatórios e dados do seu cultivo para Excel, PDF ou integrações.</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-green-600 font-semibold text-base">Tenha controle total dos seus dados</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Histórico de Cultivo Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center">
          <div className="flex justify-center md:justify-start order-1 md:order-1 items-center">
            <div className="group relative w-full max-w-none transition-transform duration-300 cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-green-500 opacity-0 group-hover:opacity-70 blur-2xl transition-all duration-500 pointer-events-none z-0" />
              <Image
                src="/historico.png"
                alt="Mockup do Histórico de Cultivo da ErvApp"
                width={800}
                height={500}
                className="relative rounded-2xl shadow-2xl border border-green-100 w-full h-auto object-contain bg-green-50 z-10 transition-transform duration-300 group-hover:scale-105"
                quality={90}
                loading="lazy"
                priority={false}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20">Histórico</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:gap-4 order-2 md:order-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">Histórico de Cultivo Visual</h2>
            <p className="text-gray-700 text-lg mb-4">
              Acompanhe cada etapa do seu cultivo com o nosso histórico visual interativo. Registre eventos, fotos, tarefas e observações em uma timeline fácil de navegar, garantindo controle total e aprendizado contínuo a cada ciclo.
            </p>
            <ul className="space-y-3 mb-4">
              <li className="flex items-center text-base text-gray-800">
                <BookOpen className="w-5 h-5 text-green-500 mr-2" />
                Timeline completa com fotos e eventos
              </li>
              <li className="flex items-center text-base text-gray-800">
                <Calendar className="w-5 h-5 text-green-500 mr-2" />
                Registro diário de tarefas e observações
              </li>
              <li className="flex items-center text-base text-gray-800">
                <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                Análise de evolução e produtividade por ciclo
              </li>
              <li className="flex items-center text-base text-gray-800">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Aprenda com o passado para colher mais no futuro
              </li>
            </ul>
            <div className="w-full flex justify-center">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-fit"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Ver Meu Histórico
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sistema Inteligente IA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center">
          <div className="order-1 md:order-2 flex justify-center md:justify-center items-center">
            <div className="group relative w-[500px] transition-transform duration-300 cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-green-500 opacity-0 group-hover:opacity-70 blur-2xl transition-all duration-500 pointer-events-none z-0" />
              <Image
                src="/analiseinteligente.png"
                alt="Mockup do Sistema Inteligente IA da ErvApp"
                width={500}
                height={500}
                className="relative rounded-2xl shadow-2xl border border-green-100 w-[500px] h-[500px] object-contain bg-green-50 z-10 transition-transform duration-300 group-hover:scale-105"
                quality={90}
                loading="lazy"
                priority={false}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
          <div className="order-2 md:order-1 flex flex-col gap-2 md:gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">Sistema Inteligente de Análise IA</h2>
            <p className="text-gray-700 text-lg mb-4">
              O Sistema Inteligente da ErvApp utiliza inteligência artificial de ponta para analisar dados dos seus cultivos, identificar padrões, prever problemas e recomendar ações personalizadas para maximizar sua produção e evitar perdas.
            </p>
            <ul className="space-y-3 mb-4">
              <li className="flex items-center text-base text-gray-800">
                <Brain className="w-5 h-5 text-green-500 mr-2" />
                Análise automática de dados ambientais e históricos
              </li>
              <li className="flex items-center text-base text-gray-800">
                <AlertTriangle className="w-5 h-5 text-green-500 mr-2" />
                Detecção de riscos e alertas em tempo real
              </li>
              <li className="flex items-center text-base text-gray-800">
                <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                Recomendações inteligentes para cada fase do cultivo
              </li>
              <li className="flex items-center text-base text-gray-800">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                IA que aprende com seus resultados para personalizar ainda mais as dicas
              </li>
            </ul>
            <div className="w-full flex justify-center">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-fit"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Conhecer o Sistema Inteligente
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Análise Visual com IA Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center max-w-7xl mx-auto">
            {/* Imagem */}
            <div className="flex justify-center">
              <div className="group relative max-w-2xl w-full">
                <div className="absolute inset-0 rounded-2xl bg-green-500 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 pointer-events-none" />
                <Image
                  src="/mockupimgia.png"
                  alt="Mockup da Análise Visual com IA da ErvApp"
                  width={800}
                  height={500}
                  className="relative rounded-2xl shadow-xl border border-green-100 w-full h-auto object-contain bg-green-50 transition-transform duration-300 group-hover:scale-105"
                  quality={90}
                  loading="lazy"
                  priority={false}
                />
                <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">IA Avançada</span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex flex-col justify-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-700">Análise Visual Inteligente</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Revolucione o diagnóstico das suas plantas! Tire uma foto, descreva o problema e nossa IA avançada analisará instantaneamente, identificando doenças, deficiências nutricionais, pragas e outros problemas.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-800">
                  <Brain className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Diagnóstico instantâneo por foto</span>
                </li>
                <li className="flex items-center text-gray-800">
                  <AlertTriangle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Identifica doenças, pragas e deficiências</span>
                </li>
                <li className="flex items-center text-gray-800">
                  <Lightbulb className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Recomendações de tratamento personalizadas</span>
                </li>
                <li className="flex items-center text-gray-800">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Histórico de análises para acompanhamento</span>
                </li>
              </ul>
              <div className="pt-2 w-full flex justify-center">
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Analisar Minhas Plantas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ervinho Chat Assistant Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-center">
          {/* Mockup - Aparece primeiro no mobile, segundo no desktop */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="group relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg transition-transform duration-300 cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-green-500 opacity-0 group-hover:opacity-70 blur-2xl transition-all duration-500 pointer-events-none z-0" />
              <Image
                src="/ervinhofoto.png"
                alt="Mockup do Ervinho, assistente de chat da ErvApp"
                width={400}
                height={400}
                className="relative rounded-2xl shadow-2xl border border-green-100 w-full h-auto object-contain bg-green-50 z-10 transition-transform duration-300 group-hover:scale-105"
                quality={90}
                loading="lazy"
                priority={false}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20">Novo!</span>
            </div>
          </div>
          
          {/* Texto - Aparece segundo no mobile, primeiro no desktop */}
          <div className="order-2 md:order-1 flex flex-col gap-4 md:gap-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">Conheça o Ervinho: Seu Assistente de Cultivo</h2>
            <p className="text-gray-700 text-lg mb-4">O Ervinho é o assistente de chat inteligente da ErvApp, pronto para tirar dúvidas, dar dicas e acompanhar você em cada etapa do cultivo. Fale com ele a qualquer hora para receber orientações personalizadas, alertas e recomendações baseadas em IA.</p>
            <ul className="space-y-3 mb-4">
              <li className="flex items-center text-base text-gray-800"><Bot className="w-5 h-5 text-green-500 mr-2" />Responde dúvidas sobre cultivo 24/7</li>
              <li className="flex items-center text-base text-gray-800"><Bot className="w-5 h-5 text-green-500 mr-2" />Sugestões automáticas para cada fase</li>
              <li className="flex items-center text-base text-gray-800"><Bot className="w-5 h-5 text-green-500 mr-2" />Alertas inteligentes e lembretes</li>
              <li className="flex items-center text-base text-gray-800"><Bot className="w-5 h-5 text-green-500 mr-2" />Aprende com seu histórico para personalizar dicas</li>
            </ul>
            <div className="w-full flex justify-center">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-fit"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Falar com o Ervinho
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Biblioteca de Strains Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center md:justify-start items-center">
            <div className="group relative w-full max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-3xl transition-transform duration-300 cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-green-500 opacity-0 group-hover:opacity-70 blur-2xl transition-all duration-500 pointer-events-none z-0" />
              <video
                src="/biblioteca.mp4"
                poster="/mockup.png"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className="relative rounded-2xl shadow-2xl border border-green-100 w-full h-auto object-contain bg-green-50 z-10 transition-transform duration-300 group-hover:scale-105"
                style={{ maxWidth: '100%', height: 'auto', minHeight: 360 }}
              />
              <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20">Nova!</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:gap-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">Biblioteca de Strains</h2>
            <p className="text-gray-700 text-lg mb-4">Explore nossa biblioteca exclusiva com mais de <span className="font-semibold text-green-700">2300 genéticas</span> de cannabis! Descubra detalhes, sabores, efeitos e informações técnicas de cada strain. Marque suas favoritas, compare variedades e encontre a genética ideal para o seu cultivo. Tudo organizado, atualizado e fácil de navegar.</p>
            <ul className="space-y-3 mb-4">
              <li className="flex items-center text-base text-gray-800"><BookOpen className="w-5 h-5 text-green-500 mr-2" />+2300 strains catalogadas</li>
              <li className="flex items-center text-base text-gray-800"><Star className="w-5 h-5 text-green-500 mr-2" />Marque e acesse suas favoritas</li>
              <li className="flex items-center text-base text-gray-800"><Lightbulb className="w-5 h-5 text-green-500 mr-2" />Filtros por sabor, efeito, linhagem e mais</li>
              <li className="flex items-center text-base text-gray-800"><BarChart3 className="w-5 h-5 text-green-500 mr-2" />Informações técnicas detalhadas</li>
              <li className="flex items-center text-base text-gray-800"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Atualizações constantes</li>
            </ul>
            <div className="w-full flex justify-center">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-fit"
                onClick={() => window.location.href = '/strains'}
              >
                Descubra sua Próxima Favorita
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA de valor */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-green-100 flex justify-center">
        <div className="max-w-2xl mx-auto text-center group">
          <div className="inline-block bg-white rounded-2xl shadow-lg px-8 py-6 border border-green-200 transition-all duration-300 group-hover:shadow-green-400 group-hover:shadow-2xl group-hover:animate-bounce">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700 flex flex-col items-center justify-center gap-2">
              <span>Pare de esquecer!</span>
              <span>Organize seu cultivo com a ErvApp <span className="text-3xl align-middle inline-block">💚</span></span>
            </h2>
            <p className="text-green-800 mt-2 text-lg">Tenha controle total, alertas inteligentes e histórico visual do seu cultivo.</p>
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section id="seguranca" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Segurança</h2>
          <div className="grid lg:grid-cols-3 gap-12">
            <Card className="bg-white border-gray-200">
              <CardHeader className="p-6 pb-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Privacidade</CardTitle>
                <p className="text-gray-600">
                  Todos os dados são criptografados e armazenados de forma segura.
                  Não compartilhamos suas informações com terceiros.
                </p>
              </CardHeader>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardHeader className="p-6 pb-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Segurança de Dados</CardTitle>
                <p className="text-gray-600">
                  Nossa equipe de segurança é constantemente treinada para detectar e
                  prevenir ameaças.
                </p>
              </CardHeader>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardHeader className="p-6 pb-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Proteção de Dados</CardTitle>
                <p className="text-gray-600">
                  Implementamos medidas de segurança rigorosas para proteger seus dados
                  contra perda, roubo ou alteração.
                </p>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="precos" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-green-50 flex flex-col items-center">
        <div className="container mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-700 border-green-200 mb-4 text-base px-4 py-2 rounded-lg">PLANOS MENSAIS</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Planos para impulsionar seu cultivo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para ter mais produtividade, controle e inteligência no seu cultivo. Comece grátis e evolua quando quiser!
            </p>
          </div>

          {/* Cards simples para mobile */}
          <div className="grid grid-cols-1 gap-4 w-full max-w-5xl mx-auto md:hidden">
            {plans.map((p) => (
              <Card
                key={p.plan}
                className={`bg-white border ${p.popular ? 'border-green-500 ring-2 ring-green-200' : 'border-green-200'}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-gray-900">{p.name}</span>
                    <span className="text-green-700 font-extrabold">
                      {p.price === 0 ? 'Grátis' : p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{p.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm text-gray-700 space-y-1 mb-4">
                    {p.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-center"><span className="mr-2">✓</span>{f}</li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${p.popular ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-green-500 hover:bg-green-600 text-gray-900'}`}
                    onClick={() => router.push(p.plan === 'free' ? '/auth/register' : `/auth/register?plan=${p.plan}`)}
                  >
                    {p.plan === 'enterprise' ? 'Falar com Vendas' : p.plan === 'premium' ? 'Obter Premium' : (p.plan === 'basic' ? 'Assinar Agora' : 'Começar')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Card/modal comparativo interativo - apenas desktop */}
          <motion.div
            className="relative w-full max-w-5xl mx-auto rounded-3xl shadow-2xl bg-white border-2 border-green-200 transition-all duration-300 hover:shadow-green-200 hidden md:block"
            initial={{ opacity: 0, y: -80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, type: 'tween', ease: 'easeOut' }}
          >
            <table className="min-w-[900px] w-full text-base rounded-2xl">
              <thead>
                <tr className="bg-green-50">
                  <th className="py-5 px-2 border-b border-green-200 text-center font-bold text-lg">Plano</th>
                  <th className="py-5 px-2 border-b border-green-200 text-center font-bold text-lg group hover:bg-green-100 transition">Free</th>
                  <th className="py-5 px-2 border-b border-green-200 text-center font-bold text-lg group hover:bg-green-100 transition">Basic</th>
                  <th className="py-5 px-2 border-b border-green-200 text-center font-bold text-lg bg-green-100 text-green-700 group hover:bg-green-200 transition">Premium</th>
                  <th className="py-5 px-2 border-b border-green-200 text-center font-bold text-lg group hover:bg-green-100 transition">Enterprise</th>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-2 border-b border-green-100 font-bold text-center text-gray-700">Preço</td>
                  <td className="py-2 px-2 border-b border-green-100 text-center font-bold text-green-600">Grátis</td>
                  <td className="py-2 px-2 border-b border-green-100 text-center font-bold text-green-700">R$ 14,90</td>
                  <td className="py-2 px-2 border-b border-green-100 text-center font-bold text-green-800 bg-green-50">R$ 34,90</td>
                  <td className="py-2 px-2 border-b border-green-100 text-center font-bold text-yellow-700">R$ 119,90</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-2 border-b border-green-100 font-bold text-center text-gray-700">Selecionar</td>
                  <td className="py-2 px-2 border-b border-green-100 text-center"><Button size="sm" className="bg-green-500 hover:bg-green-600 text-white w-32 mx-auto shadow-md transition-transform hover:scale-105" onClick={() => router.push("/auth/register")}>Começar</Button></td>
                  <td className="py-2 px-2 border-b border-green-100 text-center"><Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white w-32 mx-auto shadow-md transition-transform hover:scale-105" onClick={() => router.push("/auth/register?plan=basic")}>Assinar Agora</Button></td>
                  <td className="py-2 px-2 border-b border-green-100 text-center bg-green-50"><Button size="sm" className="bg-green-700 hover:bg-green-800 text-white font-bold shadow-lg w-32 mx-auto transition-transform hover:scale-110 animate-bounce" onClick={() => router.push("/auth/register?plan=premium")}>Obter Premium</Button></td>
                  <td className="py-2 px-2 border-b border-green-100 text-center"><Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white w-32 mx-auto shadow-md transition-transform hover:scale-105" onClick={() => router.push("/auth/register?plan=enterprise")}>Falar com Vendas</Button></td>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Dashboard Inteligente', free: true, basic: true, premium: true, enterprise: true },
                  { label: 'Histórico de Cultivos', free: true, basic: true, premium: true, enterprise: true },
                  { label: 'Gráficos no Histórico', free: true, basic: true, premium: true, enterprise: true },
                  { label: 'Biblioteca de Strains', free: true, basic: true, premium: true, enterprise: true },
                  { label: 'Comparação de Cultivos', free: false, basic: true, premium: true, enterprise: true },
                  { label: 'Exportação de Dados', free: false, basic: true, premium: true, enterprise: true },
                  { label: 'Relatórios Básicos', free: false, basic: true, premium: true, enterprise: true },
                  { label: 'Alertas Inteligentes', free: false, basic: true, premium: true, enterprise: true },
                  { label: 'Analytics Avançado', free: false, basic: false, premium: true, enterprise: true },
                  { label: 'Chat Assistente (Ervinho)', free: false, basic: false, premium: true, enterprise: true },
                  { label: 'Análise Visual com IA', free: false, basic: false, premium: true, enterprise: true },
                  { label: 'Cultivos Ativos', free: '6', basic: '20', premium: '50', enterprise: 'Ilimitado' },
                  { label: 'Armazenamento', free: '1GB', basic: '5GB', premium: '20GB', enterprise: '100GB' },
                  { label: 'Suporte Prioritário', free: false, basic: false, premium: false, enterprise: true },
                ].map((row, idx) => (
                  <tr key={row.label} className={idx % 2 === 0 ? 'bg-white group transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:bg-green-50' : 'bg-green-50 group transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:bg-green-100'}>
                    <td className="py-3 px-2 border-b border-green-100 font-medium text-center text-gray-700 align-middle">{row.label}</td>
                    {[row.free, row.basic, row.premium, row.enterprise].map((val, i) => (
                      <td key={i} className={`py-3 px-2 border-b border-green-100 text-center align-middle ${i === 2 ? 'bg-green-50 font-bold group-hover:bg-green-200 transition' : ''}`}>
                        {val === true && <span className="inline-flex w-7 h-7 rounded-full bg-green-200 text-green-700 font-bold items-center justify-center mx-auto text-lg shadow-sm transition-transform group-hover:scale-110">✓</span>}
                        {val === false && <span className="inline-flex w-7 h-7 rounded-full bg-red-100 text-red-400 font-bold items-center justify-center mx-auto text-lg shadow-sm transition-transform group-hover:scale-110">✗</span>}
                        {typeof val === 'string' && <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-700 font-semibold mx-auto text-base shadow-sm transition-transform group-hover:scale-105">{val}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Efeito de brilho/destaque no plano Premium */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-full bg-gradient-to-b from-green-100/60 via-transparent to-transparent rounded-3xl blur-2xl opacity-60 animate-pulse z-0" style={{ left: '62%' }} />
          </motion.div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              ✓ Cancelamento a qualquer momento • ✓ Suporte 24/7 • ✓ Garantia de 7 dias
            </p>
          </div>
        </div>
      </section>

      {/* Chamada motivacional pós-tabela de preços */}
      <section className="w-full flex flex-col items-center justify-center py-14 px-4 bg-gradient-to-b from-green-50 via-white to-green-100 relative overflow-hidden">
        {/* Glow animado de fundo */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[420px] h-[220px] bg-green-300/30 rounded-full blur-3xl animate-pulse z-0" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <p className="text-lg sm:text-2xl text-gray-800 mb-6 font-semibold">
            Você já viu tudo o que o <span className="text-green-600 font-extrabold">ErvApp</span> pode fazer por você.<br />
            <span className="text-green-700 font-bold underline underline-offset-4 decoration-yellow-400">Agora, responda para si mesmo:</span>
            <br />
            <span className="text-green-700 text-2xl font-extrabold block mt-2 animate-pulse">Quanto valem seu tempo e sua colheita?</span>
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-500 hover:from-green-600 hover:to-green-700 text-white font-extrabold text-lg px-10 py-5 shadow-2xl rounded-full transition-all duration-300 transform hover:scale-110 ring-4 ring-green-200/40 mb-2"
            onClick={() => router.push("/auth/register")}
          >
            Investir no meu cultivo agora
          </Button>
          <p className="text-sm text-gray-500 mt-2 italic">Não perca a oportunidade de transformar seu cultivo. O futuro da sua colheita começa aqui!</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="faq-ia" className="border border-green-100 rounded-2xl bg-white shadow-sm transition-all">
                <AccordionTrigger className="px-6 py-5 text-lg font-semibold rounded-2xl hover:bg-green-50 transition-all">
                  Como funciona a IA Preditiva?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-gray-800 bg-green-50/60 rounded-b-2xl text-base font-medium">
                  A IA Preditiva analisa dados históricos de sua propriedade para identificar padrões e prever possíveis problemas, como infestações, doenças e condições climáticas adversas.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-privacidade" className="border border-green-100 rounded-2xl bg-white shadow-sm transition-all">
                <AccordionTrigger className="px-6 py-5 text-lg font-semibold rounded-2xl hover:bg-green-50 transition-all">
                  Qual é a garantia de privacidade?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-gray-800 bg-green-50/60 rounded-b-2xl text-base font-medium">
                  Temos um compromisso absoluto com a privacidade. Não armazenamos dados de localização, nome ou informações sigilosas.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-cancelamento" className="border border-green-100 rounded-2xl bg-white shadow-sm transition-all">
                <AccordionTrigger className="px-6 py-5 text-lg font-semibold rounded-2xl hover:bg-green-50 transition-all">
                  Posso cancelar a assinatura a qualquer momento?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-gray-800 bg-green-50/60 rounded-b-2xl text-base font-medium">
                  Sim, você pode cancelar a assinatura a qualquer momento. Não cobramos taxas de cancelamento.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-seguranca" className="border border-green-100 rounded-2xl bg-white shadow-sm transition-all">
                <AccordionTrigger className="px-6 py-5 text-lg font-semibold rounded-2xl hover:bg-green-50 transition-all">
                  A ErvApp é segura para minhas plantas?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-gray-800 bg-green-50/60 rounded-b-2xl text-base font-medium">
                  Sim, a ErvApp é projetada para ser segura e confiável. Utilizamos criptografia de ponta a ponta e medidas de segurança rigorosas.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-emerald-900 via-emerald-950 to-gray-900 text-gray-300 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">ErvApp</h3>
            <p className="text-gray-400 mb-4">
              Transformando dados em resultados para você.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Sobre</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="#funcionalidades" className="text-gray-400 hover:text-white transition-colors">
                  Nossos Serviços
                </Link>
              </li>
              <li>
                <Link href="#contato" className="text-gray-400 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/ajuda" className="text-gray-400 hover:text-white transition-colors">
                  Ajuda
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Receba as últimas notícias e dicas sobre cultivo.
            </p>
            <form className="flex space-x-3">
              <input
                type="email"
                placeholder="Seu email"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Inscrever
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} ErvApp. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}