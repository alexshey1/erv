"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Gauge,
  Thermometer,
  Droplets,
  Info
} from "lucide-react"
import type { CultivationPattern, ParameterBaseline } from "@/lib/anomaly-detector"

interface AnomalyPatternDetailsProps {
  patterns: CultivationPattern[]
}

const parameterIcons = {
  "pH": Gauge,
  "Condutividade Elétrica (EC)": Droplets,
  "Temperatura": Thermometer,
  "Umidade": Droplets,
}

const phaseColors = {
  vegetative: "bg-green-100 text-green-800",
  flowering: "bg-purple-100 text-purple-800",
  curing: "bg-orange-100 text-orange-800",
}

export function AnomalyPatternDetails({ patterns }: AnomalyPatternDetailsProps) {
  const [selectedPattern, setSelectedPattern] = useState<CultivationPattern | null>(null)

  if (patterns.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Brain className="h-5 w-5" />
            Padrões Aprendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-muted-foreground">
              O sistema ainda está aprendendo padrões dos seus cultivos.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete mais cultivos para que o sistema possa identificar padrões de sucesso.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Brain className="h-5 w-5" />
          Padrões Aprendidos
          <Badge variant="secondary" className="ml-2">
            {patterns.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern) => (
            <Card 
              key={`${pattern.strain}_${pattern.phase}`}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedPattern === pattern ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedPattern(pattern)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{pattern.strain}</h3>
                    <Badge className={phaseColors[pattern.phase]}>
                      {pattern.phase === "vegetative" ? "Vegetativo" : 
                       pattern.phase === "flowering" ? "Floração" : "Cura"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Taxa de Sucesso</div>
                    <div className="font-semibold text-green-600">
                      {(pattern.successRate * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground">
                  {pattern.sampleSize} amostras analisadas
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedPattern && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">
              Detalhes: {selectedPattern.strain} - {selectedPattern.phase}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(selectedPattern.parameters).map(([paramName, baseline]) => {
                const Icon = parameterIcons[paramName as keyof typeof parameterIcons] || Info
                
                return (
                  <div key={paramName} className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{paramName}</span>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Média:</span>
                        <span className="font-semibold">{baseline.mean.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Desvio Padrão:</span>
                        <span>{baseline.standardDeviation.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Faixa Ideal:</span>
                        <span>
                          {baseline.optimalRange.min.toFixed(2)} - {baseline.optimalRange.max.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min-Max:</span>
                        <span>
                          {baseline.min.toFixed(2)} - {baseline.max.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Taxa de Sucesso:</span>
                <span className="font-semibold text-green-600">
                  {(selectedPattern.successRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Amostras Analisadas:</span>
                <span className="font-semibold">{selectedPattern.sampleSize}</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          <p>
            Estes padrões são usados como referência para detectar anomalias em cultivos ativos.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 