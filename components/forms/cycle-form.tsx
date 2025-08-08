"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { CycleParams } from "@/types/cultivation"

interface CycleFormProps {
  params: CycleParams
  onChange: (params: CycleParams) => void
}

export function CycleForm({ params, onChange }: CycleFormProps) {
  const updateParam = (key: keyof CycleParams, value: number) => {
    onChange({ ...params, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Potência Iluminação (W)</Label>
        <div className="px-3">
          <Slider
            value={[params.potencia_watts]}
            onValueChange={([value]) => updateParam("potencia_watts", value)}
            max={2000}
            min={50}
            step={10}
            className="w-full"
          />
        </div>
        <div className="text-sm text-gray-500 text-right font-medium">{params.potencia_watts}W</div>
      </div>

      <div className="space-y-3">
        <Label>Número de Plantas</Label>
        <div className="px-3">
          <Slider
            value={[params.num_plantas]}
            onValueChange={([value]) => updateParam("num_plantas", value)}
            max={30}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
        <div className="text-sm text-gray-500 text-right font-medium">{params.num_plantas} plantas</div>
      </div>

      <div className="space-y-3">
        <Label>Produção por Planta (g)</Label>
        <div className="px-3">
          <Slider
            value={[params.producao_por_planta_g]}
            onValueChange={([value]) => updateParam("producao_por_planta_g", value)}
            max={250}
            min={10}
            step={5}
            className="w-full"
          />
        </div>
        <div className="text-sm text-gray-500 text-right font-medium">{params.producao_por_planta_g}g</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Dias Vegetativo</Label>
          <Input
            type="number"
            value={params.dias_vegetativo}
            onChange={(e) => updateParam("dias_vegetativo", Number(e.target.value))}
            min={15}
            max={120}
            className="font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label>Horas Luz (Veg)</Label>
          <Input
            type="number"
            value={params.horas_luz_veg}
            onChange={(e) => updateParam("horas_luz_veg", Number(e.target.value))}
            min={12}
            max={24}
            className="font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Dias Floração</Label>
          <Input
            type="number"
            value={params.dias_floracao}
            onChange={(e) => updateParam("dias_floracao", Number(e.target.value))}
            min={45}
            max={120}
            className="font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label>Horas Luz (Flora)</Label>
          <Input
            type="number"
            value={params.horas_luz_flor}
            onChange={(e) => updateParam("horas_luz_flor", Number(e.target.value))}
            min={8}
            max={16}
            className="font-medium"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Dias Secagem/Cura</Label>
        <Input
          type="number"
          value={params.dias_secagem_cura}
          onChange={(e) => updateParam("dias_secagem_cura", Number(e.target.value))}
          min={7}
          max={40}
          className="font-medium"
        />
      </div>
    </div>
  )
}
