"use client"

import TrichomeAnalysisLayoutWrapper from "@/components/layout/trichome-analysis-layout-wrapper";
import TrichomeAnalysisContent from "@/components/views/trichome-analysis-content";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Loader2, Microscope } from "lucide-react";

export default function TrichomeAnalysisPage() {
  const { user, loading } = useAuthContext();

  // Mostrar loading enquanto as permissões estão sendo verificadas
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
          <Microscope className="h-8 w-8 text-emerald-600" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span className="text-lg font-medium text-gray-700">
            Verificando permissões...
          </span>
        </div>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Aguarde enquanto verificamos suas permissões para acessar a análise de tricomas
        </p>
      </div>
    );
  }

  return (
    <PermissionGuard user={user} permission="canUseVisualAnalysis">
      <TrichomeAnalysisLayoutWrapper>
        <TrichomeAnalysisContent />
      </TrichomeAnalysisLayoutWrapper>
    </PermissionGuard>
  );
}
