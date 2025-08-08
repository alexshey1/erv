"use client"

import { useState } from "react"

interface DonutChartProps {
  data: Record<string, number>
}

export function DonutChart({ data }: DonutChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)

  const total = Object.values(data).reduce((sum, value) => sum + value, 0)
  const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"]

  let cumulativePercentage = 0
  const segments = Object.entries(data).map(([key, value], index) => {
    const percentage = (value / total) * 100
    const startAngle = cumulativePercentage * 3.6 // Convert to degrees
    const endAngle = (cumulativePercentage + percentage) * 3.6

    cumulativePercentage += percentage

    return {
      key,
      value,
      percentage,
      startAngle,
      endAngle,
      color: colors[index % colors.length],
    }
  })

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const createPath = (startAngle: number, endAngle: number) => {
    const centerX = 120
    const centerY = 120
    const radius = 80
    const innerRadius = 50

    const startAngleRad = (startAngle - 90) * (Math.PI / 180)
    const endAngleRad = (endAngle - 90) * (Math.PI / 180)

    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)

    const x3 = centerX + innerRadius * Math.cos(endAngleRad)
    const y3 = centerY + innerRadius * Math.sin(endAngleRad)
    const x4 = centerX + innerRadius * Math.cos(startAngleRad)
    const y4 = centerY + innerRadius * Math.sin(startAngleRad)

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`
  }

  return (
    <div className="flex flex-col items-center justify-center sm:flex-row sm:items-start">
      <div className="relative w-full max-w-[240px]">
        <svg width="100%" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
          {segments.map((segment) => (
            <path
              key={segment.key}
              d={createPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer transition-opacity hover:opacity-80"
              onMouseEnter={() => setHoveredSegment(segment.key)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          ))}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 ml-0 w-full max-w-xs sm:mt-0 sm:ml-8 sm:w-auto">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              hoveredSegment === segment.key ? "bg-gray-50" : ""
            }`}
          >
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.color }} />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{segment.key}</div>
              <div className="text-xs text-gray-500">
                {formatCurrency(segment.value)} ({segment.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
