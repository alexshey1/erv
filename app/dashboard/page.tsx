'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import GlobalLoading from '../loading'

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [cycleParams, setCycleParams] = useState<any>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    // Verificar autenticação
    fetch('/api/auth/supabase/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user || null);
        setCheckingAuth(false);
      })
      .catch(() => setCheckingAuth(false));

    // Verificar se o usuário já passou pelo onboarding
    const onboardingCompleted = localStorage.getItem('ervapp_onboarding_completed');
    
    if (!onboardingCompleted) {
      // Se não passou pelo onboarding, redirecionar
      router.push('/onboarding');
      return;
    }
    
    setCheckingOnboarding(false);

    // Carregar dados do cultivo
    fetch('/api/cultivation')
      .then(res => res.json())
      .then(data => {
        if (data.cultivations && data.cultivations.length > 0) {
          setCycleParams(data.cultivations[0]);
          setResults(data.cultivations);
        }
      });
  }, [router]);

  if (checkingAuth || checkingOnboarding) return <GlobalLoading />;
  if (!user) return <div className="p-8 text-center text-lg">Faça login para acessar o dashboard.</div>;

  return <DashboardContent results={results} cycleParams={cycleParams} user={user} />;
} 