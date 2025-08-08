"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Share2, 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  Users, 
  Link2,
  Twitter,
  Facebook,
  Instagram,
  MessageCircle,
  Trophy,
  Leaf,
  DollarSign,
  Calendar,
  CheckCircle
} from "lucide-react"
import type { CultivationSummary, CultivationEvent } from "@/lib/mock-data"

interface CultivationSharingProps {
  cultivation: CultivationSummary
  events: CultivationEvent[]
  onClose: () => void
}

interface ShareSettings {
  includeFinancials: boolean
  includeTimeline: boolean
  includePersonalNotes: boolean
  isPublic: boolean
  allowComments: boolean
}

interface ShareableData {
  id: string
  name: string
  strain: string
  startDate: string
  endDate?: string
  duration: number
  yield: number
  status: string
  financials?: {
    profit: number
    roi: number
  }
  timeline?: CultivationEvent[]
  stats: {
    efficiency: number
    successRate: number
  }
  achievements: string[]
}

export function CultivationSharing({ cultivation, events, onClose }: CultivationSharingProps) {
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    includeFinancials: false,
    includeTimeline: true,
    includePersonalNotes: false,
    isPublic: true,
    allowComments: true
  })
  
  const [shareUrl, setShareUrl] = useState("")
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [customMessage, setCustomMessage] = useState("")
  const [shareStats, setShareStats] = useState({
    views: 0,
    likes: 0,
    comments: 0
  })

  // Gerar dados compartilháveis baseados nas configurações
  const generateShareableData = (): ShareableData => {
    const efficiency = cultivation.durationDays > 0 ? cultivation.yield_g / cultivation.durationDays : 0
    
    const achievements: string[] = []
    if (cultivation.yield_g > 100) achievements.push("🏆 Alto Rendimento")
    if (cultivation.profit_brl > 1000) achievements.push("💰 Altamente Lucrativo")
    if (efficiency > 2) achievements.push("⚡ Super Eficiente")
    if (!cultivation.hasSevereProblems) achievements.push("🌟 Cultivo Perfeito")
    if (cultivation.durationDays < 90) achievements.push("🚀 Ciclo Rápido")

    return {
      id: cultivation.id,
      name: cultivation.name,
      strain: cultivation.seedStrain,
      startDate: cultivation.startDate,
      endDate: cultivation.endDate || undefined,
      duration: cultivation.durationDays,
      yield: cultivation.yield_g,
      status: cultivation.status,
      financials: shareSettings.includeFinancials ? {
        profit: cultivation.profit_brl,
        roi: cultivation.profit_brl > 0 ? (cultivation.profit_brl / 1000) * 100 : 0
      } : undefined,
      timeline: shareSettings.includeTimeline ? events : undefined,
      stats: {
        efficiency,
        successRate: cultivation.hasSevereProblems ? 75 : 95
      },
      achievements
    }
  }

  // Gerar link de compartilhamento
  const generateShareLink = async () => {
    setIsGeneratingLink(true)
    
    try {
      const shareableData = generateShareableData()
      
      // Simular geração de link (em produção, seria uma API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const shareId = btoa(JSON.stringify(shareableData)).substring(0, 12)
      const url = `${window.location.origin}/share/cultivation/${shareId}`
      
      setShareUrl(url)
      
      // Salvar dados compartilháveis no localStorage (em produção seria no backend)
      localStorage.setItem(`share_${shareId}`, JSON.stringify(shareableData))
      
    } catch (error) {
      console.error("Erro ao gerar link:", error)
    } finally {
      setIsGeneratingLink(false)
    }
  }

  // Copiar link para clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      // Mostrar feedback visual
    } catch (error) {
      console.error("Erro ao copiar:", error)
    }
  }

  // Compartilhar em redes sociais
  const shareToSocial = (platform: string) => {
    const shareableData = generateShareableData()
    const message = customMessage || generateDefaultMessage(shareableData)
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + " " + shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`
    }
    
    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
    }
  }

  // Gerar mensagem padrão
  const generateDefaultMessage = (data: ShareableData): string => {
    const messages = [
      `🌱 Acabei de colher ${data.yield}g da minha ${data.strain}!`,
      `💚 ${data.duration} dias de cultivo resultaram em ${data.yield}g de ${data.strain}`,
      `🏆 Meu cultivo de ${data.strain} foi um sucesso! ${data.achievements.join(" ")}`
    ]
    
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Share2 className="h-6 w-6" />
              Compartilhar Cultivo
            </h2>
            <p className="text-muted-foreground">
              Compartilhe seus resultados com a comunidade
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Eye className="h-5 w-5" />
          </Button>
        </div>

        {/* Preview do Cultivo */}
        <Card className="mb-6 border-2 border-green-200 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{cultivation.name}</h3>
                <p className="text-muted-foreground">{cultivation.seedStrain}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {generateShareableData().achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{cultivation.yield_g}g</div>
                <div className="text-xs text-muted-foreground">Rendimento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{cultivation.durationDays}</div>
                <div className="text-xs text-muted-foreground">Dias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(cultivation.yield_g / cultivation.durationDays).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">g/dia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {cultivation.hasSevereProblems ? "75%" : "95%"}
                </div>
                <div className="text-xs text-muted-foreground">Sucesso</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Compartilhamento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Configurações de Privacidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Incluir Dados Financeiros</Label>
                <p className="text-sm text-muted-foreground">Mostrar lucro e ROI</p>
              </div>
              <Switch
                checked={shareSettings.includeFinancials}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, includeFinancials: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Incluir Timeline</Label>
                <p className="text-sm text-muted-foreground">Mostrar eventos do cultivo</p>
              </div>
              <Switch
                checked={shareSettings.includeTimeline}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, includeTimeline: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Compartilhamento Público</Label>
                <p className="text-sm text-muted-foreground">Visível para todos</p>
              </div>
              <Switch
                checked={shareSettings.isPublic}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, isPublic: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Permitir Comentários</Label>
                <p className="text-sm text-muted-foreground">Outros podem comentar</p>
              </div>
              <Switch
                checked={shareSettings.allowComments}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, allowComments: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Mensagem Personalizada */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Mensagem Personalizada</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Conte sobre sua experiência com este cultivo..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Gerar Link */}
        {!shareUrl ? (
          <Button 
            onClick={generateShareLink} 
            disabled={isGeneratingLink}
            className="w-full mb-6"
          >
            {isGeneratingLink ? (
              <>Gerando Link...</>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Gerar Link de Compartilhamento
              </>
            )}
          </Button>
        ) : (
          <Card className="mb-6 border-2 border-blue-200 bg-blue-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Link gerado com sucesso!</span>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Estatísticas de Compartilhamento */}
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-bold">{shareStats.views}</div>
                  <div className="text-muted-foreground">Visualizações</div>
                </div>
                <div>
                  <div className="font-bold">{shareStats.likes}</div>
                  <div className="text-muted-foreground">Curtidas</div>
                </div>
                <div>
                  <div className="font-bold">{shareStats.comments}</div>
                  <div className="text-muted-foreground">Comentários</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões de Compartilhamento Social */}
        {shareUrl && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Compartilhar em Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => shareToSocial('facebook')}
                  className="flex items-center gap-2"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => shareToSocial('telegram')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Telegram
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ações Finais */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
          {shareUrl && (
            <Button 
              onClick={() => window.open(shareUrl, '_blank')}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar Compartilhamento
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}