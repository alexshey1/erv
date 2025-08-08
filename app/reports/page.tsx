import { ReportsContent } from '@/components/views/reports-content';
import { headers } from 'next/headers';

export default async function ReportsPage() {
  const host = (await headers()).get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const resUser = await fetch(`${protocol}://${host}/api/auth/supabase/me`, { cache: 'no-store', credentials: 'include' });
  const { user } = await resUser.json();
  const resCultivations = await fetch(`${protocol}://${host}/api/cultivation`, { cache: 'no-store', credentials: 'include' });
  const { cultivations } = await resCultivations.json();
  const results = cultivations;
  const setupParams = cultivations && cultivations.length > 0 ? cultivations[0] : null;
  const cycleParams = setupParams;
  const marketParams = setupParams ? { preco_venda_por_grama: setupParams.preco_venda_por_grama } : null;
  return <ReportsContent user={user} results={results} setupParams={setupParams} cycleParams={cycleParams} marketParams={marketParams} />;
} 