import { Sparklines, SparklinesLine } from "react-sparklines"

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  width?: number
}

export function Sparkline({ data, color = "#22c55e", height = 24, width = 80 }: SparklineProps) {
  return (
    <Sparklines data={data} height={height} width={width} margin={4}>
      <SparklinesLine color={color} style={{ fill: "none" }} />
    </Sparklines>
  )
} 