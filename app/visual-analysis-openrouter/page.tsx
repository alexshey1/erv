"use client"

import VisualAnalysisOpenRouterLayoutWrapper from "@/components/layout/visual-analysis-openrouter-layout-wrapper";
import VisualAnalysisOpenRouterContent from "@/components/views/visual-analysis-openrouter-content";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Loader2, BrainCircuit } from "lucide-react";

export default function VisualAnalysisOpenRouterPage() {
  const { user, loading } = useAuthContext();

  // Mostrar loading enquanto as permissões estão sendo verificadas
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <BrainCircuit className="h-8 w-8 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-lg font-medium text-gray-700">
            Verificando permissões...
          </span>
        </div>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Aguarde enquanto verificamos suas permissões para acessar a análise visual IA
        </p>
      </div>
    );
  }

  return (
    <PermissionGuard user={user} permission="canUseVisualAnalysis">
      <VisualAnalysisOpenRouterLayoutWrapper>
        <VisualAnalysisOpenRouterContent />
      </VisualAnalysisOpenRouterLayoutWrapper>
    </PermissionGuard>
  );
}
