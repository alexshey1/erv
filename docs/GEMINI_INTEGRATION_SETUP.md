# 🔧 Configuração da Integração com Google Gemini AI

## 📋 Visão Geral

Esta documentação explica como configurar e usar a integração com o Google Gemini AI no sistema de cultivo.

## 🚀 Funcionalidades Implementadas

### 1. **Análise de Dados de Sensores**
- Análise de dados de pH, temperatura, umidade, EC, luz e CO2
- Detecção de anomalias e padrões
- Recomendações baseadas em dados reais

### 2. **Análise Visual de Plantas**
- Upload de imagens das plantas
- Análise combinada de imagem + dados dos sensores
- Identificação de problemas visuais

### 3. **Recomendações Personalizadas**
- Geração de recomendações específicas
- Baseadas no strain, fase do cultivo e dados atuais
- Otimizações para melhor rendimento

## ⚙️ Configuração

### 1. **Variáveis de Ambiente**

Adicione ao seu arquivo `.env.local`:

```bash
# Google Gemini AI
GEMINI_API_KEY="AIzaSyDarLESrIbF76k4CcsRjPUlEFhukwIiAkA"
```

### 2. **Estrutura de Arquivos Criada**

```
lib/
├── gemini-service.ts          # Serviço principal do Gemini
└── ai-integration-examples.ts # Factory atualizado

app/api/ai/gemini/
├── analyze/route.ts           # Análise de dados
├── vision/route.ts            # Análise visual
└── recommendations/route.ts   # Recomendações

components/
└── gemini-ai-assistant.tsx   # Componente de interface

app/test-gemini/
└── page.tsx                   # Página de teste
```

## 🔌 APIs Disponíveis

### 1. **Análise de Dados**
```typescript
POST /api/ai/gemini/analyze
{
  "sensorData": [
    {
      "sensorType": "ph",
      "value": 6.2,
      "unit": "",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ],
  "cultivationInfo": {
    "strain": "OG Kush",
    "phase": "flowering",
    "daysSinceStart": 45,
    "numPlants": 6
  },
  "userQuery": "Como posso melhorar o rendimento?",
  "includeRecommendations": true,
  "includePredictions": true
}
```

### 2. **Análise Visual**
```typescript
POST /api/ai/gemini/vision
{
  "imageData": "base64_encoded_image",
  "sensorData": [...],
  "cultivationPhase": "flowering"
}
```

### 3. **Recomendações**
```typescript
POST /api/ai/gemini/recommendations
{
  "sensorData": [...],
  "cultivationInfo": {
    "strain": "OG Kush",
    "phase": "flowering",
    "daysSinceStart": 45
  },
  "includeOptimization": true,
  "includeTroubleshooting": true
}
```

## 🧪 Testando a Integração

### 1. **Página de Teste**
Acesse `/test-gemini` para testar todas as funcionalidades.

### 2. **Dados de Teste**
O sistema inclui dados mockados para demonstração:
- pH: 6.2
- Temperatura: 24.5°C
- Umidade: 65%
- EC: 1.3 mS/cm
- Luz: 45000 lux
- CO2: 800 ppm

### 3. **Componente de Demonstração**
O componente `AIIntegrationDemo` foi atualizado para incluir a opção "Gemini".

## 📊 Respostas da API

### Estrutura de Resposta Padrão
```typescript
{
  "success": true,
  "data": {
    "analysis": "Análise detalhada dos dados...",
    "recommendations": [
      "Aumentar umidade para 70%",
      "Monitorar pH mais frequentemente"
    ],
    "predictions": {
      "yield": 480,
      "confidence": 0.85,
      "factors": ["Temperatura ideal", "pH estável"]
    },
    "anomalies": [
      {
        "parameter": "humidity",
        "severity": "medium",
        "description": "Umidade abaixo do ideal",
        "recommendation": "Aumentar umidade do ambiente"
      }
    ],
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

## 🔒 Segurança

### 1. **Validação de Entrada**
- Todas as APIs usam Zod para validação
- Verificação de tipos e formatos
- Sanitização de dados

### 2. **Tratamento de Erros**
- Erros de API são capturados e logados
- Respostas de erro estruturadas
- Fallbacks para casos de falha

### 3. **Rate Limiting**
- Implementar rate limiting nas APIs
- Proteção contra abuso

## 🚀 Uso no Frontend

### 1. **Componente Principal**
```typescript
import { GeminiAIAssistant } from "@/components/gemini-ai-assistant"

<GeminiAIAssistant
  cultivationId="cultivation-123"
  cultivationName="OG Kush - Floração"
  currentSensorData={sensorData}
/>
```

### 2. **Chamadas Diretas**
```typescript
const response = await fetch('/api/ai/gemini/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestData)
})
```

## 🔧 Troubleshooting

### 1. **Erro de Chave API**
```
Error: Chave API do Gemini não configurada
```
**Solução:** Verifique se `GEMINI_API_KEY` está definida no `.env.local`

### 2. **Erro de Validação**
```
Error: Dados de entrada inválidos
```
**Solução:** Verifique o formato dos dados enviados

### 3. **Erro de Rede**
```
Error: Gemini API Error: 429
```
**Solução:** Aguarde e tente novamente (rate limit)

## 📈 Próximos Passos

### 1. **Melhorias Planejadas**
- Cache de respostas para otimizar performance
- Histórico de análises
- Comparação entre diferentes cultivos
- Integração com sistema de alertas

### 2. **Funcionalidades Avançadas**
- Análise de tendências temporais
- Predição de problemas futuros
- Otimização automática de parâmetros
- Relatórios personalizados

### 3. **Integração com Outros Sistemas**
- Conectar com sensores reais
- Integração com sistemas de automação
- Exportação de dados para análise externa

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Teste com dados mockados primeiro
3. Verifique a configuração da chave API
4. Consulte a documentação da API do Google Gemini

---

**Nota:** Esta integração está em fase beta. Teste adequadamente antes de usar em produção. 