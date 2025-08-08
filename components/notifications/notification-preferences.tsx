'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, Mail, Smartphone, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { NotificationPreferences } from '@/lib/types/notifications'

interface NotificationPreferencesProps {
  userId: string
}

export function NotificationPreferencesComponent({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Carregar preferências
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/notifications/preferences')
        const data = await response.json()

        if (data.success) {
          setPreferences(data.preferences)
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error)
        toast.error('Erro ao carregar preferências de notificação')
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // Salvar preferências
  const savePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      })

      const data = await response.json()

      if (data.success) {
        setPreferences(data.preferences)
        toast.success('Preferências salvas com sucesso!')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      toast.error('Erro ao salvar preferências')
    } finally {
      setSaving(false)
    }
  }

  // Atualizar preferência específica
  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return

    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    savePreferences({ [key]: value })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Valores padrão se não existir preferências
  const prefs = preferences || {
    reminders: true,
    alerts: true,
    achievements: true,
    marketing: false,
    pushEnabled: true,
    emailEnabled: true,
    quietHoursStart: 22,
    quietHoursEnd: 8,
    timezone: 'America/Sao_Paulo'
  }

  return (
    <div className="space-y-6">
      {/* Tipos de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Tipos de Notificação
          </CardTitle>
          <CardDescription>
            Escolha quais tipos de notificação você deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="reminders">Lembretes</Label>
              <p className="text-sm text-muted-foreground">
                Rega, nutrição, poda e outras atividades
              </p>
            </div>
            <Switch
              id="reminders"
              checked={prefs.reminders}
              onCheckedChange={(checked) => updatePreference('reminders', checked)}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="alerts">Alertas</Label>
              <p className="text-sm text-muted-foreground">
                Problemas detectados, condições anômalas
              </p>
            </div>
            <Switch
              id="alerts"
              checked={prefs.alerts}
              onCheckedChange={(checked) => updatePreference('alerts', checked)}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="achievements">Conquistas</Label>
              <p className="text-sm text-muted-foreground">
                Marcos, recordes e gamificação
              </p>
            </div>
            <Switch
              id="achievements"
              checked={prefs.achievements}
              onCheckedChange={(checked) => updatePreference('achievements', checked)}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="marketing">Marketing</Label>
              <p className="text-sm text-muted-foreground">
                Novidades, dicas e promoções
              </p>
            </div>
            <Switch
              id="marketing"
              checked={prefs.marketing}
              onCheckedChange={(checked) => updatePreference('marketing', checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Canais de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Canais de Entrega
          </CardTitle>
          <CardDescription>
            Como você deseja receber as notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <div className="space-y-1">
                <Label htmlFor="push">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações no navegador
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={prefs.pushEnabled}
              onCheckedChange={(checked) => updatePreference('pushEnabled', checked)}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-green-500" />
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações por email
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={prefs.emailEnabled}
              onCheckedChange={(checked) => updatePreference('emailEnabled', checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Horário de Silêncio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horário de Silêncio
          </CardTitle>
          <CardDescription>
            Período em que não receberá push notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quiet-start">Início</Label>
              <Select
                value={prefs.quietHoursStart?.toString() || '22'}
                onValueChange={(value) => updatePreference('quietHoursStart', parseInt(value))}
                disabled={saving}
              >
                <SelectTrigger id="quiet-start">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiet-end">Fim</Label>
              <Select
                value={prefs.quietHoursEnd?.toString() || '8'}
                onValueChange={(value) => updatePreference('quietHoursEnd', parseInt(value))}
                disabled={saving}
              >
                <SelectTrigger id="quiet-end">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Durante este período, você não receberá push notifications.
            Notificações in-app e email não são afetadas.
          </p>
        </CardContent>
      </Card>

      {/* Status */}
      {saving && (
        <div className="text-center text-sm text-muted-foreground">
          Salvando preferências...
        </div>
      )}
    </div>
  )
}