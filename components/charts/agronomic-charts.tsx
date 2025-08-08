"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { AgronomicDataPoint } from "@/lib/mock-data"

interface AgronomicChartsProps {
  data: AgronomicDataPoint[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  // Formatar data e hora para dd/MM/yyyy HH:mm
  let dataFormatada = label
  try {
    const d = new Date(label)
    dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {}
  return (
    <div className="bg-white border rounded shadow p-2 text-xs min-w-[120px]">
      <div className="font-semibold mb-1">{dataFormatada}</div>
      {point.ph !== undefined && (
        <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-[#8884d8]" />pH: <span className="font-bold">{point.ph}</span></div>
      )}
      {point.ec !== undefined && (
        <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-[#ff7300]" />EC: <span className="font-bold">{point.ec}</span></div>
      )}
      {point.avg_temperature_c !== undefined && (
        <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-[#82ca9d]" />Temp: <span className="font-bold">{point.avg_temperature_c}°C</span></div>
      )}
      {point.avg_humidity_percent !== undefined && (
        <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-[#ffc658]" />Umidade: <span className="font-bold">{point.avg_humidity_percent}%</span></div>
      )}
    </div>
  )
}

export function AgronomicCharts({ data }: AgronomicChartsProps) {
  // Ordenar por data ISO antes de formatar
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const formattedData = sortedData
    .map((point) => ({
      ...point,
      date: new Date(point.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
      avg_temperature_c: (point.temperature_c || (point as any).temperature_min + (point as any).temperature_max) / 2,
      avg_humidity_percent: (point.humidity_percent || (point as any).humidity_min + (point as any).humidity_max) / 2,
    }))

  const isEmpty = !formattedData || formattedData.length === 0

  return (
    <Card className="shadow-sm relative">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Parâmetros Agronômicos ao Longo do Tempo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* pH Chart */}
        <div>
          <h3 className="text-md font-medium mb-2">pH</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[5.5, 7.0]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ph" stroke="#8884d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Temperature Chart */}
        <div>
          <h3 className="text-md font-medium mb-2">Temperatura Média (°C)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[18, 30]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avg_temperature_c" stroke="#82ca9d" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Humidity Chart */}
        <div>
          <h3 className="text-md font-medium mb-2">Umidade Média (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[30, 80]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avg_humidity_percent" stroke="#ffc658" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* EC Chart */}
        <div>
          <h3 className="text-md font-medium mb-2">EC (Condutividade Elétrica)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0.5, 2.5]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ec" stroke="#ff7300" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Mensagem sobreposta se não houver dados */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-muted-foreground bg-white/80 px-4 py-2 rounded shadow">Aguardando dados agronômicos...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
