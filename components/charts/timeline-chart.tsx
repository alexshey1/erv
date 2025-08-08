"use client"

import { Leaf, Flower, Droplet } from "lucide-react"

interface TimelineChartProps {
  cycleParams: any
}

export function TimelineChart({ cycleParams }: TimelineChartProps) {
  const phases = [
    {
      name: "Vegetativo",
      duration: cycleParams.dias_vegetativo,
      color: "#10B981",
      icon: <Leaf className="w-7 h-7 md:w-8 md:h-8 text-green-300" />,
    },
    {
      name: "Floração",
      duration: cycleParams.dias_floracao,
      color: "#F59E0B",
      icon: <Flower className="w-7 h-7 md:w-8 md:h-8 text-yellow-300" />,
    },
    {
      name: "Cura",
      duration: cycleParams.dias_secagem_cura,
      color: "#A78BFA",
      icon: <Droplet className="w-7 h-7 md:w-8 md:h-8 text-purple-300" />,
    },
  ]

  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0)

  let cumulativeDays = 0

  return (
    <div className="space-y-8">
      {/* Barra de fases refinada */}
      <div className="relative">
        <div className="flex h-14 rounded-full overflow-hidden shadow-lg border border-gray-100">
          {phases.map((phase, index) => {
            const width = (phase.duration / totalDuration) * 100
            const minWidthPx = 90
            // Para a fase "Cura", sempre mostrar o texto, mesmo se a barra for estreita
            const showText = phase.name === "Cura" || width > 12
            return (
              <div
                key={index}
                className={
                  `flex items-center justify-center text-white font-bold text-base relative group transition-all duration-300 ` +
                  (index !== 0 ? 'border-l border-white' : '')
                }
                style={{ width: `${width}%`, minWidth: showText ? `${minWidthPx}px` : '48px', backgroundColor: phase.color }}
              >
                <div className="flex flex-col items-center w-full px-1 md:px-2">
                  <span>{phase.icon}</span>
                  <span className="text-xs md:text-sm font-bold tracking-tight mt-1 whitespace-nowrap overflow-visible text-center w-full break-words">
                    {phase.name}
                  </span>
                </div>
                {/* Tooltip acessível */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow pointer-events-none">
                  {phase.name}: {phase.duration} dias
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium px-1">
          <span>Dia 0</span>
          <span>Dia {totalDuration}</span>
        </div>
      </div>
      {/* Cards das fases */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {phases.map((phase, index) => {
          const startDay = phases.slice(0, index).reduce((sum, p) => sum + p.duration, 0)
          const endDay = startDay + phase.duration
          return (
            <div key={index} className="bg-white rounded-xl p-4 shadow border border-gray-100 flex flex-col items-center text-center min-h-[120px]">
              <span className="text-2xl mb-2" style={{ color: phase.color }}>{phase.icon}</span>
              <span className="font-bold text-base mb-1" style={{ color: phase.color }}>{phase.name}</span>
              <span className="text-xs text-gray-500 mb-1">Duração: {phase.duration} dias</span>
              <span className="text-xs text-gray-400">Período: Dia {startDay} - {endDay}</span>
            </div>
          )
        })}
      </div>
      {/* Resumo do ciclo */}
      <div className="mt-2 rounded-xl bg-green-50 border border-green-100 p-4 flex flex-col items-center shadow">
        <span className="text-green-700 font-bold text-base md:text-lg">Ciclo Completo: {totalDuration} dias</span>
        <span className="text-green-600 text-sm mt-1">Aproximadamente {(totalDuration / 30).toFixed(1)} meses</span>
      </div>
    </div>
  )
}
