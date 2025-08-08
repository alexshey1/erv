"use client";
import { useCultivationSimulator } from "@/hooks/useCultivationSimulator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SetupForm } from "@/components/forms/setup-form";
import { CycleForm } from "@/components/forms/cycle-form";
import { MarketForm } from "@/components/forms/market-form";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { CalculadoraPPFD } from "@/components/ppfd-calculator";

import type { SetupParams, CycleParams, MarketParams } from "@/types/cultivation";

interface SimulatorContentProps {
  setupParams?: SetupParams;
  cycleParams?: CycleParams;
  marketParams?: MarketParams;
  results?: any;
  onSetupChange?: (params: SetupParams) => void;
  onCycleChange?: (params: CycleParams) => void;
  onMarketChange?: (params: MarketParams) => void;
}

const defaultResults = {
  custo_total_investimento: 4800.0,
  custo_operacional_total_ciclo: 1945.52,
  receita_bruta_ciclo: 21600.0,
  lucro_liquido_ciclo: 19654.48,
  custo_por_grama: 4.05,
  gramas_por_watt: 1.0,
  gramas_por_m2: 213.33,
  periodo_payback_ciclos: 0.24,
  roi_investimento_1_ano: 896.37,
  duracao_total_ciclo: 175,
  detalhe_custos_operacionais: {
    "Energia Elétrica": 875.52,
    "Nutrientes": 350,
    "Outros Custos (Ciclo)": 100,
    "Sementes/Clones": 500,
    "Substrato": 120,
  },
};

export function SimulatorContent({
  setupParams,
  cycleParams,
  marketParams,
  results,
  onSetupChange,
  onCycleChange,
  onMarketChange,
}: SimulatorContentProps) {
  // Garante que nunca haverá erro de undefined
  const safeResults = { ...defaultResults, ...results };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Simulador</h1>
        <p className="text-gray-600 mt-2">Ajuste os parâmetros e veja os resultados em tempo real</p>
      </div>
      <KPICards results={safeResults} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Parâmetros de Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="cycle">Ciclo</TabsTrigger>
                <TabsTrigger value="market">Mercado</TabsTrigger>
              </TabsList>
              <TabsContent value="setup" className="mt-6">
                {setupParams && onSetupChange && (
                  <SetupForm params={setupParams} onChange={onSetupChange} />
                )}
              </TabsContent>
              <TabsContent value="cycle" className="mt-6">
                {cycleParams && onCycleChange && (
                  <CycleForm params={cycleParams} onChange={onCycleChange} />
                )}
              </TabsContent>
              <TabsContent value="market" className="mt-6">
                {marketParams && onMarketChange && (
                  <MarketForm params={marketParams} onChange={onMarketChange} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Resultados da Simulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cálculo de economia e valor de mercado */}
            {(() => {
              const numPlantas = cycleParams?.num_plantas || 0;
              const rendimentoPorPlanta = cycleParams?.producao_por_planta_g || 0;
              const precoMercado = marketParams?.preco_venda_por_grama || 35;
              const producaoTotal = numPlantas * rendimentoPorPlanta;
              const valorMercado = producaoTotal * precoMercado;
              const setupZero = (setupParams?.custo_equip_iluminacao === 0 && setupParams?.custo_tenda_estrutura === 0 && setupParams?.custo_ventilacao_exaustao === 0 && setupParams?.custo_outros_equipamentos === 0);
              const custoSetup = setupZero ? 0 : safeResults.custo_total_investimento;
              const economia = valorMercado - safeResults.custo_operacional_total_ciclo - custoSetup;
              const economiaPercent = valorMercado > 0 ? (economia / valorMercado) * 100 : 0;
              return (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{economia > 0 ? `R$ ${economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}</div>
                    <div className="text-sm text-green-700">Economia por ciclo</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-700">Se comprasse no mercado ilegal: <b>R$ {valorMercado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-3 bg-green-400" style={{ width: `${Math.max(0, Math.min(100, economiaPercent)).toFixed(0)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-green-700">{economiaPercent.toFixed(0)}% de economia</span>
                  </div>
                  <div className="text-xs text-green-800 bg-green-100 rounded p-2 text-center">
                    ✔️ Além de economizar, você não financia o tráfico e tem controle total sobre a qualidade do seu produto.
                  </div>
                </div>
              );
            })()}
            {/* Detalhes */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Investimento Setup</span>
                <span className="font-medium">R$ {safeResults.custo_total_investimento?.toFixed(2) ?? '--'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Custo por Ciclo</span>
                <span className="font-medium">R$ {safeResults.custo_operacional_total_ciclo?.toFixed(2) ?? '--'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Receita por Ciclo</span>
                <span className="font-medium">R$ {safeResults.receita_bruta_ciclo?.toFixed(2) ?? '--'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Duração do Ciclo</span>
                <span className="font-medium">{safeResults.duracao_total_ciclo ?? '--'} dias</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* loading && <div>Calculando...</div> */}
      {/* error && <div className="text-red-500">{error}</div> */}
      <div className="mt-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded">
          <strong>AVISO:</strong> Esta ferramenta é apenas para mostrar o quanto você economiza ao plantar. <b>Não financie o tráfico!</b> Ferramenta educativa de conscientização.
        </div>
      </div>
    </div>
  );
}
