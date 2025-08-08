import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import OnboardingGuard from "@/components/layout/onboarding-guard"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const host = (await headers()).get("host")

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return (
      <div className="p-8 text-center text-lg">Faça login para acessar o dashboard.</div>
    )
  }

  // Buscar dados completos do usuário (inclui assinatura e contagem de cultivos)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      subscription: true,
      cultivations: { select: { id: true } },
    },
  })

  // Buscar cultivos do usuário diretamente via Prisma (evita round-trip de API)
  const cultivations = await prisma.cultivation.findMany({
    where: { userId: authUser.id },
    take: 10,
    orderBy: { createdAt: "desc" },
  })

  const cycleParams = cultivations && cultivations.length > 0 ? cultivations[0] : null
  const results = cultivations ?? []

  const userForPermissions = dbUser ? {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    subscription: dbUser.subscription,
    cultivationCount: dbUser.cultivations.length,
  } : { id: authUser.id, email: authUser.email }

  return (
    <>
      <OnboardingGuard />
      <DashboardContent results={results} cycleParams={cycleParams} user={userForPermissions} />
    </>
  )
} 