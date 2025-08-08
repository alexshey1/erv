"use client";
import { useCultivationSimulator } from "@/hooks/useCultivationSimulator";
import { SimulatorContent } from "./simulator-content";
import { CostsContent } from "./costs-content";
import { ComparisonContent } from "./comparison-content";
import { AnalyticsContent } from "@/components/views/analytics-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculadoraPPFD } from "@/components/ppfd-calculator";

export function SimulatorOrchestratorClient({
  initialSetupParams,
  initialCycleParams,
  initialMarketParams,
  initialResults,
}: any) {
  const sim = useCultivationSimulator(
    initialSetupParams,
    initialCycleParams,
    initialMarketParams,
    initialResults
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <Tabs defaultValue="simulador" className="w-full">
        <TabsList className="mb-8 flex flex-wrap gap-2 justify-center bg-transparent border-none shadow-none p-0">
          <TabsTrigger value="simulador" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 data-[state=active]:font-bold data-[state=active]:shadow-md px-6 py-2 rounded-lg transition-all hover:bg-emerald-50 hover:text-emerald-900 text-gray-700">
            Simulador
          </TabsTrigger>
          <TabsTrigger value="ppfd" className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-900 data-[state=active]:font-bold data-[state=active]:shadow-md px-6 py-2 rounded-lg transition-all hover:bg-lime-50 hover:text-lime-900 text-gray-700">
            PPFD
          </TabsTrigger>
          <TabsTrigger value="custos" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-900 data-[state=active]:font-bold data-[state=active]:shadow-md px-6 py-2 rounded-lg transition-all hover:bg-red-50 hover:text-red-900 text-gray-700">
            Custos
          </TabsTrigger>
          <TabsTrigger value="comparacao" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:font-bold data-[state=active]:shadow-md px-6 py-2 rounded-lg transition-all hover:bg-blue-50 hover:text-blue-900 text-gray-700">
            Comparação
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 data-[state=active]:font-bold data-[state=active]:shadow-md px-6 py-2 rounded-lg transition-all hover:bg-green-50 hover:text-green-900 text-gray-700">
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="simulador">
          <SimulatorContent
            setupParams={sim.setupParams}
            cycleParams={sim.cycleParams}
            marketParams={sim.marketParams}
            results={sim.results}
            onSetupChange={sim.onSetupChange}
            onCycleChange={sim.onCycleChange}
            onMarketChange={sim.onMarketChange}
          />
        </TabsContent>
        <TabsContent value="ppfd">
          <CalculadoraPPFD />
        </TabsContent>
        <TabsContent value="custos">
          <CostsContent
            results={sim.results}
            setupParams={sim.setupParams}
            cycleParams={sim.cycleParams}
            marketParams={sim.marketParams}
          />
        </TabsContent>
        <TabsContent value="comparacao">
          <ComparisonContent
            setupParams={sim.setupParams}
            cycleParams={sim.cycleParams}
            marketParams={sim.marketParams}
          />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsContent results={sim.results} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 