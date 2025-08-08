import { useState, useEffect } from "react";
import { calculateResults } from "@/lib/cultivation-calculator";

export function useCultivationSimulator(
  initialSetup: any,
  initialCycle: any,
  initialMarket: any,
  initialResults: any
) {
  const [setupParams, setSetupParams] = useState(initialSetup);
  const [cycleParams, setCycleParams] = useState(initialCycle);
  const [marketParams, setMarketParams] = useState(initialMarket);
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function recalculate(newSetup: any, newCycle: any, newMarket: any) {
    setLoading(true);
    setError(null);
    try {
      const data = calculateResults(newSetup, newCycle, newMarket);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  // Dispara o cálculo inicial ao montar, se necessário
  useEffect(() => {
    if (!initialResults || !initialResults.custo_total_investimento) {
      recalculate(initialSetup, initialCycle, initialMarket);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSetupChange(newSetup: any) {
    setSetupParams(newSetup);
    recalculate(newSetup, cycleParams, marketParams);
  }
  function onCycleChange(newCycle: any) {
    setCycleParams(newCycle);
    recalculate(setupParams, newCycle, marketParams);
  }
  function onMarketChange(newMarket: any) {
    setMarketParams(newMarket);
    recalculate(setupParams, cycleParams, newMarket);
  }

  return {
    setupParams,
    cycleParams,
    marketParams,
    results,
    loading,
    error,
    onSetupChange,
    onCycleChange,
    onMarketChange,
  };
} 