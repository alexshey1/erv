"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface EditCultivationModalProps {
  isOpen: boolean
  editData: {
    name: string
    seedStrain: string
    startDate: string
    status: "active" | "completed" | "archived"
    yield_g: string
  }
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onChange: (field: string, value: string) => void
}

export function EditCultivationModal({
  isOpen,
  editData,
  onClose,
  onSubmit,
  onChange
}: EditCultivationModalProps) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cultivo</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Cultivo</Label>
            <Input
              id="name"
              value={editData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Nome do cultivo"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="seedStrain">Genética</Label>
            <Input
              id="seedStrain"
              value={editData.seedStrain}
              onChange={(e) => onChange('seedStrain', e.target.value)}
              placeholder="Nome da genética"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startDate">Data de Início</Label>
            <Input
              id="startDate"
              type="date"
              value={editData.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={editData.status} onValueChange={(value) => onChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="yield_g">Rendimento (g)</Label>
            <Input
              id="yield_g"
              type="number"
              step="0.1"
              value={editData.yield_g}
              onChange={(e) => onChange('yield_g', e.target.value)}
              placeholder="0.0"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!editData.name || !editData.seedStrain || !editData.startDate}
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 