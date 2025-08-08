# 🛡️ Análise de Rate Limiting - ErvApp

## 📊 Status Atual

### ✅ Protegido pelo Supabase
- **Autenticação** (login/registro/logout)
- **Database queries** via Supabase client
- **Realtime subscriptions**
- **Storage** (se usar Supabase Storage)

### ❌ NÃO Protegido (APIs customizadas)
- `/api/ai/gemini/*` - **CRÍTICO** 🔴
- `/api/upload-image` - **ALTO** 🟡  
- `/api/weather` - **MÉDIO** 🟡
- `/api/translate` - **MÉDIO** 🟡
- `/api/email/*` - **ALTO** 🟡

## 🎯 Recomendação

**IMPLEMENTAR rate limiting customizado** para APIs próprias, especialmente:

### 1. APIs de IA (Gemini) - PRIORIDADE MÁXIMA
- **Risco:** Custos elevados, abuse de API externa
- **Limite sugerido:** 10 requests/minuto por usuário
- **Implementação:** Upstash Redis + middleware

### 2. Upload de Imagens - ALTA PRIORIDADE  
- **Risco:** Abuse de storage, custos Cloudinary
- **Limite sugerido:** 5 uploads/minuto por usuário
- **Implementação:** Rate limiting + validação de tamanho

### 3. APIs de Terceiros - MÉDIA PRIORIDADE
- **Risco:** Limite de APIs externas, custos
- **Limite sugerido:** 20 requests/minuto por usuário

## 🛠️ Implementação Recomendada

Usar **@upstash/ratelimit** (já está no package.json) com Redis para:
- Rate limiting por usuário autenticado
- Rate limiting por IP para usuários anônimos
- Diferentes limites por tipo de API
- Logs de tentativas de abuse

## 📈 Impacto no Score de Segurança

**Sem rate limiting customizado:** 8.0/10
**Com rate limiting implementado:** 8.5/10 (+0.5)