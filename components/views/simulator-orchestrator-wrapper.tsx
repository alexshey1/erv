"use client";

import { SimulatorOrchestratorClient } from "@/components/views/simulator-orchestrator-client";

interface SimulatorOrchestratorWrapperProps {
  initialSetupParams: Record<string, any>;
  initialCycleParams: Record<string, any>;
  initialMarketParams: Record<string, any>;
  initialResults: Record<string, any>;
}

export default function SimulatorOrchestratorWrapper({
  initialSetupParams,
  initialCycleParams,
  initialMarketParams,
  initialResults,
}: SimulatorOrchestratorWrapperProps) {
  if (!initialSetupParams || !initialCycleParams || !initialMarketParams || !initialResults) {
    console.error("Propriedades iniciais estão indefinidas:", {
      initialSetupParams,
      initialCycleParams,
      initialMarketParams,
      initialResults,
    });
    return <div>Erro ao carregar os dados do simulador.</div>;
  }

  return (
    <SimulatorOrchestratorClient
      initialSetupParams={initialSetupParams}
      initialCycleParams={initialCycleParams}
      initialMarketParams={initialMarketParams}
      initialResults={initialResults}
    />
  );
}
