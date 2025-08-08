"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { MarketParams } from "@/types/cultivation"

interface MarketFormProps {
  params: MarketParams
  onChange: (params: MarketParams) => void
}

export function MarketForm({ params, onChange }: MarketFormProps) {
  const updateParam = (key: keyof MarketParams, value: number) => {
    onChange({ ...params, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Preço kWh (R$)</Label>
        <Input
          type="number"
          value={params.preco_kwh}
          onChange={(e) => updateParam("preco_kwh", Number(e.target.value))}
          min={0.1}
          max={2}
          step={0.05}
          className="font-medium"
        />
      </div>

      <div className="space-y-2">
        <Label>Custo Sementes/Clones (R$)</Label>
        <Input
          type="number"
          value={params.custo_sementes_clones}
          onChange={(e) => updateParam("custo_sementes_clones", Number(e.target.value))}
          min={100}
          max={2000}
          step={50}
          className="font-medium"
        />
      </div>

      <div className="space-y-2">
        <Label>Custo Substrato (R$)</Label>
        <Input
          type="number"
          value={params.custo_substrato}
          onChange={(e) => updateParam("custo_substrato", Number(e.target.value))}
          min={50}
          max={500}
          step={10}
          className="font-medium"
        />
      </div>

      <div className="space-y-2">
        <Label>Custo Nutrientes (R$)</Label>
        <Input
          type="number"
          value={params.custo_nutrientes}
          onChange={(e) => updateParam("custo_nutrientes", Number(e.target.value))}
          min={100}
          max={1000}
          step={25}
          className="font-medium"
        />
      </div>

      <div className="space-y-2">
        <Label>Outros Custos/Ciclo (R$)</Label>
        <Input
          type="number"
          value={params.custos_operacionais_misc}
          onChange={(e) => updateParam("custos_operacionais_misc", Number(e.target.value))}
          min={50}
          max={500}
          step={25}
          className="font-medium"
        />
      </div>

      <div className="space-y-3">
        <Label>Preço:</Label>
        <div className="px-3">
          <Slider
            value={[params.preco_venda_por_grama]}
            onValueChange={([value]) => updateParam("preco_venda_por_grama", value)}
            max={100}
            min={10}
            step={1}
            className="w-full"
          />
        </div>
        <div className="text-sm text-gray-500 text-right font-medium">
          R$ {params.preco_venda_por_grama.toFixed(2)}/g
        </div>
      </div>
    </div>
  )
}
