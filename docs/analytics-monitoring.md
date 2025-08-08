# Analytics e Monitoramento de Performance

## 🚀 Vercel Speed Insights & Analytics

### Configuração Implementada

1. **Speed Insights**: Monitora Core Web Vitals em tempo real
2. **Analytics**: Coleta dados de tráfego e comportamento do usuário
3. **Performance Monitor**: Sistema customizado para métricas detalhadas
4. **Error Tracking**: Captura e registra erros JavaScript

### Componentes Adicionados

```tsx
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { PerformanceMonitor, ErrorBoundaryMonitor } from "@/components/analytics/performance-monitor"

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
        <PerformanceMonitor />
        <ErrorBoundaryMonitor />
      </body>
    </html>
  )
}
```

## 📊 Métricas Coletadas

### Core Web Vitals (Vercel Speed Insights)

1. **LCP (Largest Contentful Paint)**
   - Tempo para carregar o maior elemento visível
   - Meta: < 2.5s

2. **FID (First Input Delay)**
   - Tempo de resposta à primeira interação
   - Meta: < 100ms

3. **CLS (Cumulative Layout Shift)**
   - Estabilidade visual da página
   - Meta: < 0.1

4. **FCP (First Contentful Paint)**
   - Tempo para primeiro conteúdo visível
   - Meta: < 1.8s

5. **TTFB (Time to First Byte)**
   - Tempo de resposta do servidor
   - Meta: < 800ms

### Métricas Customizadas

- **Navigation Timing**: Tempos de carregamento detalhados
- **DNS Lookup**: Tempo de resolução DNS
- **TCP Connect**: Tempo de conexão
- **Server Response**: Tempo de resposta do servidor

## 🔍 Monitoramento em Tempo Real

### Dashboard Vercel
- Acesse: [Vercel Dashboard > Analytics](https://vercel.com/dashboard)
- Visualize métricas em tempo real
- Analise tendências de performance
- Identifique páginas com problemas

### Logs de Desenvolvimento
```javascript
// Console do navegador mostrará:
📊 Web Vital: {
  name: "LCP",
  value: 1234,
  rating: "good",
  id: "unique-id"
}

🚀 Navigation Metrics: {
  domContentLoaded: 456,
  loadComplete: 789,
  dnsLookup: 12,
  tcpConnect: 34,
  serverResponse: 567
}
```

## 🚨 Error Tracking

### Tipos de Erros Capturados

1. **JavaScript Errors**
   - Erros de sintaxe
   - Erros de runtime
   - Erros de referência

2. **Promise Rejections**
   - Promises não tratadas
   - Async/await failures

3. **Critical Errors**
   - Erros relacionados a pagamento
   - Falhas de autenticação
   - Problemas de segurança

### API Endpoints

- `POST /api/analytics/web-vitals` - Coleta métricas de performance
- `POST /api/analytics/errors` - Registra erros JavaScript

## 📈 Otimizações Baseadas em Dados

### Performance
1. **Imagens**: Otimização automática com Next.js Image
2. **Fonts**: Preload de Google Fonts
3. **Bundle**: Code splitting automático
4. **Cache**: Headers otimizados por tipo de recurso

### Monitoramento Contínuo
1. **Alertas**: Configurar alertas para métricas ruins
2. **Trends**: Acompanhar tendências semanais/mensais
3. **A/B Testing**: Testar otimizações com dados reais

## 🛠️ Configuração Avançada

### Integração com Sentry (Opcional)
```javascript
// Adicionar ao performance monitor
import * as Sentry from "@sentry/nextjs"

function sendToSentry(metric) {
  Sentry.addBreadcrumb({
    message: `Web Vital: ${metric.name}`,
    data: metric,
    level: metric.rating === 'poor' ? 'warning' : 'info'
  })
}
```

### Custom Events
```javascript
// Rastrear eventos específicos da aplicação
import { track } from '@vercel/analytics'

// Exemplo: Rastrear criação de cultivo
track('cultivation_created', {
  strain: 'White Widow',
  method: 'indoor'
})
```

## 📋 Checklist de Monitoramento

### Diário
- [ ] Verificar alertas críticos
- [ ] Revisar erros JavaScript
- [ ] Monitorar tempo de resposta das APIs

### Semanal
- [ ] Analisar tendências de Core Web Vitals
- [ ] Revisar páginas com pior performance
- [ ] Identificar padrões de erro

### Mensal
- [ ] Relatório completo de performance
- [ ] Comparar com mês anterior
- [ ] Planejar otimizações baseadas em dados
- [ ] Revisar e ajustar alertas

## 🎯 Metas de Performance

### Targets Atuais
- **LCP**: < 2.0s (excelente)
- **FID**: < 50ms (excelente)
- **CLS**: < 0.05 (excelente)
- **TTFB**: < 500ms (excelente)

### Benchmarks da Indústria
- **E-commerce**: LCP < 2.5s, FID < 100ms
- **SaaS**: LCP < 2.0s, FID < 50ms
- **Mobile**: Adicionar 20% aos targets desktop

## 🔧 Troubleshooting

### Performance Issues
1. **LCP Alto**: Otimizar imagens, lazy loading
2. **FID Alto**: Reduzir JavaScript, code splitting
3. **CLS Alto**: Definir dimensões de imagens/elementos
4. **TTFB Alto**: Otimizar servidor, cache, CDN

### Monitoring Issues
1. **Dados não aparecem**: Verificar CSP headers
2. **Rate limiting**: Ajustar limites nas APIs
3. **Erros de CORS**: Verificar domínios permitidos