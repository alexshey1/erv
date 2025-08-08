"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Calendar, 
  Leaf, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Zap,
  Target,
  Award,
  Eye,
  ThumbsUp
} from "lucide-react"

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
  timeline?: any[]
  stats: {
    efficiency: number
    successRate: number
  }
  achievements: string[]
}

export default function SharedCultivationPage() {
  const params = useParams()
  const shareId = params?.shareId as string
  
  const [shareData, setShareData] = useState<ShareableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [views, setViews] = useState(0)

  useEffect(() => {
    const loadSharedData = () => {
      try {
        // Tentar carregar do localStorage (em produção seria uma API)
        const saved = localStorage.getItem(`share_${shareId}`)
        if (saved) {
          const data = JSON.parse(saved)
          setShareData(data)
          
          // Simular estatísticas
          setLikes(Math.floor(Math.random() * 50) + 5)
          setViews(Math.floor(Math.random() * 200) + 20)
        } else {
          // Tentar decodificar do shareId se não encontrar no localStorage
          try {
            const decoded = JSON.parse(atob(shareId))
            setShareData(decoded)
            setLikes(Math.floor(Math.random() * 50) + 5)
            setViews(Math.floor(Math.random() * 200) + 20)
          } catch {
            console.error("Compartilhamento não encontrado")
          }
        }
      } catch (error) {
        console.error("Erro ao carregar compartilhamento:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSharedData()
  }, [shareId])

  const handleLike = () => {
    setLiked(!liked)
    setLikes(prev => liked ? prev - 1 : prev + 1)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Cultivo de ${shareData?.name}`,
        text: `Confira este incrível cultivo de ${shareData?.strain}!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo"
      case "completed": return "Concluído"
      case "archived": return "Arquivado"
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando compartilhamento...</p>
        </div>
      </div>
    )
  }

  if (!shareData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Compartilhamento não encontrado</h1>
          <p className="text-muted-foreground mb-6">Este link pode ter expirado ou não existe.</p>
          <Button onClick={() => window.location.href = "/"}>
            Ir para o Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Cultivation Dashboard</h1>
                <p className="text-sm text-muted-foreground">Compartilhamento Público</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {views} visualizações
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {likes} curtidas
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Cultivo Header */}
        <Card className="mb-8 border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{shareData.name}</h1>
                <p className="text-xl text-muted-foreground mb-4">{shareData.strain}</p>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(shareData.status)}>
                    {getStatusLabel(shareData.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Iniciado em {new Date(shareData.startDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarFallback className="bg-green-600 text-white text-xl">
                    {shareData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">Cultivador</p>
              </div>
            </div>

            {/* Achievements */}
            {shareData.achievements.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {shareData.achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {achievement}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{shareData.yield}g</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Leaf className="h-4 w-4" />
                  Rendimento
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{shareData.duration}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  Dias
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {shareData.stats.efficiency.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Zap className="h-4 w-4" />
                  g/dia
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {shareData.stats.successRate}%
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Target className="h-4 w-4" />
                  Sucesso
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Financeiros (se incluídos) */}
        {shareData.financials && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resultados Financeiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formatCurrency(shareData.financials.profit)}
                  </div>
                  <div className="text-sm text-muted-foreground">Lucro Líquido</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {shareData.financials.roi.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">ROI</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline (se incluída) */}
        {shareData.timeline && shareData.timeline.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline do Cultivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shareData.timeline.slice(0, 10).map((event, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))}
                {shareData.timeline.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground">
                    ... e mais {shareData.timeline.length - 10} eventos
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4">
              <Button 
                onClick={handleLike}
                variant={liked ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'Curtido' : 'Curtir'} ({likes})
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comentar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t">
          <p className="text-muted-foreground mb-4">
            Gostou deste cultivo? Crie o seu próprio dashboard!
          </p>
          <Button onClick={() => window.location.href = "/"}>
            <Trophy className="h-4 w-4 mr-2" />
            Começar Meu Cultivo
          </Button>
        </div>
      </div>
    </div>
  )
}