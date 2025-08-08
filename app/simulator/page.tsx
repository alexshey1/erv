import SimulatorOrchestratorWrapper from "../../components/views/simulator-orchestrator-wrapper";
import { headers } from "next/headers";

export default async function SimulatorPage() {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const resCultivations = await fetch(`${protocol}://${host}/api/cultivation`, { cache: "no-store", credentials: "include" });
  const { cultivations } = await resCultivations.json();
  const defaultSetupParams = { area_m2: 2.25, custo_equip_iluminacao: 2000, custo_tenda_estrutura: 1500, custo_ventilacao_exaustao: 800, custo_outros_equipamentos: 500 };
  const defaultCycleParams = { potencia_watts: 480, num_plantas: 6, producao_por_planta_g: 80, dias_vegetativo: 60, horas_luz_veg: 18, dias_floracao: 70, horas_luz_flor: 12, dias_secagem_cura: 20 };
  const defaultMarketParams = { preco_kwh: 0.95, custo_sementes_clones: 500, custo_substrato: 120, custo_nutrientes: 350, custos_operacionais_misc: 100, preco_venda_por_grama: 45 };
  const defaultResults = {};
  const cultivation = cultivations && cultivations.length > 0 ? cultivations[0] : {};
  const setupParams = cultivation.setupParams || defaultSetupParams;
  const cycleParams = cultivation.cycleParams || defaultCycleParams;
  const marketParams = cultivation.marketParams || defaultMarketParams;
  const results = cultivation.results || defaultResults;

  return (
    <SimulatorOrchestratorWrapper
      initialSetupParams={setupParams}
      initialCycleParams={cycleParams}
      initialMarketParams={marketParams}
      initialResults={results}
    />
  );
}