"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ExternalLink } from "lucide-react"
import Link from "next/link"

interface TermsAcceptanceProps {
  onAcceptanceChange: (accepted: boolean) => void
  required?: boolean
  className?: string
}

export function TermsAcceptance({ 
  onAcceptanceChange, 
  required = true,
  className = "" 
}: TermsAcceptanceProps) {
  const [accepted, setAccepted] = useState(false)

  const handleAcceptanceChange = (checked: boolean) => {
    setAccepted(checked)
    onAcceptanceChange(checked)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 text-sm">
          <strong>Importante:</strong> Este sistema é uma ferramenta educacional. 
          Você é responsável por cumprir todas as leis aplicáveis.
        </AlertDescription>
      </Alert>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms-acceptance"
          checked={accepted}
          onCheckedChange={handleAcceptanceChange}
          className="mt-1"
        />
        <div className="space-y-1">
          <Label 
            htmlFor="terms-acceptance" 
            className="text-sm leading-relaxed cursor-pointer"
          >
            Li e aceito os{" "}
            <Link 
              href="/terms" 
              target="_blank"
              className="text-primary hover:underline inline-flex items-center space-x-1"
            >
              <span>Termos de Uso</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            {required && <span className="text-red-500">*</span>}
          </Label>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              • Concordo em usar a aplicação apenas para fins legais e educacionais
            </p>
            <p>
              • Entendo que sou responsável por verificar a conformidade legal
            </p>
            <p>
              • Aceito que os desenvolvedores não se responsabilizam pelo uso incorreto
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 