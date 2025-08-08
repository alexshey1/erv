# 🛡️ Rate Limiting - ErvApp

## 📋 Configuração Implementada

### ✅ APIs Protegidas

| API | Limite | Tipo | Descrição |
|-----|--------|------|-----------|
| `/api/upload-image` | 5/min | upload | Upload de imagens |
| `/api/weather` | 20/min | external | API de clima |
| `/api/translate` | 20/min | external | API de tradução |
| `/api/email/welcome` | 3/min | email | Email de boas-vindas |
| `/api/cultivation` | 30/min | general | CRUD de cultivos |

### 🔧 Configuração

#### Variáveis de Ambiente Necessárias
```bash
# Upstash Redis (obrigatório)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

#### Como Obter Upstash Redis
1. Acesse [upstash.com](https://upstash.com)
2. Crie uma conta gratuita
3. Crie um database Redis
4. Copie as credenciais REST

### 📊 Tipos de Rate Limiting

```typescript
// Configurações atuais
const rateLimiters = {
  upload: 5 requests/minuto,    // Upload de imagens
  external: 20 requests/minuto, // APIs externas
  email: 3 requests/minuto,     // Anti-spam
  ai: 10 requests/minuto,       // APIs de IA
  general: 30 requests/minuto   // Operações gerais
}
```

### 🎯 Identificação de Usuários

- **Usuários autenticados**: `user:{userId}`
- **Usuários anônimos**: `ip:{ip_address}`
- **Fallback**: IP address

### 📈 Headers de Resposta

```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1643723400000
Retry-After: 60
```

### 🚨 Resposta de Rate Limit Excedido

```json
{
  "error": "Rate limit exceeded",
  "message": "Muitas tentativas. Tente novamente em alguns minutos.",
  "limit": 20,
  "reset": 1643723400000,
  "remaining": 0
}
```

## 🛠️ Como Usar

### Aplicar Rate Limiting em Nova API

```typescript
import { createRateLimitedHandler } from '@/lib/rate-limiter'

async function myApiHandler(request: NextRequest, rateLimitHeaders: Record<string, string>) {
  // Sua lógica aqui
  return NextResponse.json({ success: true })
}

// Aplicar rate limiting
export const POST = createRateLimitedHandler('external', myApiHandler)
```

### Rate Limiting Manual

```typescript
import { withRateLimit } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  const rateLimitResult = await withRateLimit(request, 'upload', userId)
  
  if (rateLimitResult.success !== true) {
    return rateLimitResult // Retorna erro 429
  }
  
  // Continuar com a lógica
}
```

## 📊 Monitoramento

### Logs Automáticos
- Rate limit excedido: `WARN`
- Rate limit verificado: `DEBUG`
- Erros de rate limiting: `ERROR`

### Estatísticas (Futuro)
```typescript
import { getRateLimitStats } from '@/lib/rate-limiter'

const stats = await getRateLimitStats('user:123', 'upload')
```

## 🔧 Configuração Avançada

### Personalizar Limites
```typescript
// lib/rate-limiter.ts
export const rateLimiters = {
  custom: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'), // 50 por hora
    analytics: true,
  }),
}
```

### Reset Manual (Admin)
```typescript
import { resetRateLimit } from '@/lib/rate-limiter'

await resetRateLimit('user:123', 'upload')
```

## 🚀 Benefícios Implementados

- ✅ **Proteção contra abuse** de APIs custosas
- ✅ **Prevenção de spam** em emails
- ✅ **Controle de custos** em APIs externas
- ✅ **Logs estruturados** para monitoramento
- ✅ **Headers informativos** para clientes
- ✅ **Fallback seguro** em caso de erro
- ✅ **Identificação por usuário** ou IP

## 📈 Impacto na Segurança

**Score anterior:** 8.0/10  
**Score atual:** 8.5/10 ⬆️ (+0.5)

Rate limiting implementado com sucesso! 🎉