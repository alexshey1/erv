"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bug, AlertTriangle, FlaskConical, Info, CheckCircle } from "lucide-react"
import Image from "next/image"
import type { Incident } from "@/lib/mock-data"

interface IncidentLogProps {
  incidents: Incident[]
}

const incidentTypeIcons = {
  pest: Bug,
  disease: AlertTriangle,
  nutrient_deficiency: FlaskConical,
  environmental_stress: AlertTriangle,
  other: Info,
}

const severityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

export function IncidentLog({ incidents }: IncidentLogProps) {
  if (incidents.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Log de Ocorrências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>Nenhuma ocorrência registrada para este cultivo. Tudo sob controle!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Log de Ocorrências</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {incidents.map((incident) => {
          const Icon = incidentTypeIcons[incident.type] || Info
          const severityBadgeColor = severityColors[incident.severity] || "bg-gray-100 text-gray-800"

          return (
            <div key={incident.id} className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex-shrink-0 pt-1">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 capitalize">{incident.type.replace("_", " ")}</h3>
                  <Badge className={severityBadgeColor}>{incident.severity}</Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">{incident.description}</p>
                <div className="text-xs text-gray-500 mb-2">
                  Data: {new Date(incident.date).toLocaleDateString("pt-BR")}
                </div>
                {incident.correctiveAction && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Ação Corretiva:</span> {incident.correctiveAction}
                  </div>
                )}
                {incident.photoUrl && (
                  <div className="mt-3">
                    <Image
                      src={incident.photoUrl || "/placeholder.svg"}
                      alt={`Foto da ocorrência: ${incident.description}`}
                      width={150}
                      height={150}
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
