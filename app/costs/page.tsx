import { CostsContent } from '@/components/views/costs-content';
import { headers } from 'next/headers';

export default async function CostsPage() {
  const host = (await headers()).get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const resUser = await fetch(`${protocol}://${host}/api/auth/supabase/me`, { cache: 'no-store', credentials: 'include' });
  const { user } = await resUser.json();
  const resCultivations = await fetch(`${protocol}://${host}/api/cultivation`, { cache: 'no-store', credentials: 'include' });
  const { cultivations } = await resCultivations.json();
  const defaultSetupParams = {
    area_m2: 0,
    custo_equip_iluminacao: 0,
    custo_tenda_estrutura: 0,
    custo_ventilacao_exaustao: 0,
    custo_outros_equipamentos: 0,
  };
  const defaultResults = {
    custo_total_investimento: 0,
    custo_operacional_total_ciclo: 0,
    receita_bruta_ciclo: 0,
    lucro_liquido_ciclo: 0,
    custo_por_grama: 0,
    gramas_por_watt: 0,
    gramas_por_m2: 0,
    periodo_payback_ciclos: 0,
    roi_investimento_1_ano: 0,
    duracao_total_ciclo: 0,
    detalhe_custos_operacionais: {},
  };
  const cultivation = cultivations && cultivations.length > 0 ? cultivations[0] : {};
  const setupParams = cultivation.setupParams || defaultSetupParams;
  const results = cultivation.results || defaultResults;
  return <CostsContent results={results} setupParams={setupParams} />;
} 