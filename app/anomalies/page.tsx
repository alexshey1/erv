import AnomalyContentWrapper from '@/components/views/anomaly-content-wrapper';
import { headers } from 'next/headers';

export default async function AnomaliesPage() {
  const host = (await headers()).get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const resUser = await fetch(`${protocol}://${host}/api/auth/supabase/me`, { cache: 'no-store', credentials: 'include' });
  const { user } = await resUser.json();
  const resCultivations = await fetch(`${protocol}://${host}/api/cultivation`, { cache: 'no-store', credentials: 'include' });
  const { cultivations } = await resCultivations.json();
  return <AnomalyContentWrapper user={user} cultivations={cultivations} />;
}