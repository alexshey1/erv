"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingGuard() {
  const router = useRouter()

  useEffect(() => {
    const onboardingCompleted = typeof window !== "undefined" && localStorage.getItem("ervapp_onboarding_completed")
    if (!onboardingCompleted) {
      router.push("/onboarding")
    }
  }, [router])

  return null
} 