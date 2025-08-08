import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, Scale } from "lucide-react"

interface LegalDisclaimerProps {
  variant?: "warning" | "info" | "critical"
  className?: string
  showIcon?: boolean
}

export function LegalDisclaimer({ 
  variant = "warning", 
  className = "",
  showIcon = true 
}: LegalDisclaimerProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "critical":
        return "border-red-200 bg-red-50 text-red-800"
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800"
      default:
        return "border-orange-200 bg-orange-50 text-orange-800"
    }
  }

  const getIcon = () => {
    switch (variant) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "info":
        return <Shield className="h-4 w-4 text-blue-600" />
      default:
        return <Scale className="h-4 w-4 text-orange-600" />
    }
  }

  return (
    <Alert className={`${getVariantStyles()} ${className}`}>
      {showIcon && getIcon()}
      <AlertDescription className="text-sm">
        <strong>AVISO LEGAL:</strong> Este sistema é uma ferramenta educacional e de gestão agrícola. 
        Os usuários são <strong>100% responsáveis</strong> por verificar e cumprir todas as leis locais, 
        estaduais e federais aplicáveis. Os desenvolvedores não se responsabilizam pelo uso incorreto 
        ou ilegal da ferramenta. As análises e recomendações são sugestões educacionais e não substituem 
        consultoria profissional ou verificação legal.
      </AlertDescription>
    </Alert>
  )
} 