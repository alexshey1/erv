# 🎯 Planos e Permissões com Supabase Auth

## 🏗️ Arquitetura Atual (Híbrida - Recomendada)

### Como Funciona:
1. **Supabase Auth**: Gerencia login, registro, sessões
2. **Banco Local**: Armazena dados de usuário, planos e permissões
3. **Sincronização**: Triggers automáticos mantêm dados sincronizados

### Vantagens:
- ✅ Controle total sobre lógica de negócio
- ✅ Flexibilidade para regras customizadas
- ✅ Fácil integração com sistemas de pagamento
- ✅ Permissões complexas e dinâmicas
- ✅ Auditoria e logs detalhados

## 📊 Sistema de Planos Atual

### Estrutura no Banco:
```sql
-- Tabela users (sincronizada com Supabase Auth)
users {
  id: UUID (mesmo ID do Supabase Auth)
  email: string
  name: string
  role: 'free' | 'basic' | 'premium' | 'enterprise' | 'admin'
  avatar: string
}

-- Tabela subscriptions (gerenciada localmente)
subscriptions {
  userId: UUID (FK para users.id)
  plan: 'free' | 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate: DateTime
  endDate: DateTime
  price: Float
  features: String[] (array de permissões)
}
```

### Fluxo de Permissões:
```typescript
// 1. Usuário faz login via Supabase Auth
// 2. Sistema busca dados na tabela users local
// 3. Calcula permissões baseadas no plano da subscription
// 4. Retorna permissões para o frontend

function getUserPermissions(user) {
  if (user.role === 'admin') return ALL_PERMISSIONS
  
  if (user.subscription?.status === 'active') {
    return PLAN_PERMISSIONS[user.subscription.plan]
  }
  
  return PLAN_PERMISSIONS.free
}
```

## 🔄 Sincronização Automática

### Triggers do Supabase:
```sql
-- Quando usuário é criado no Supabase Auth
-- Automaticamente cria registro na tabela users local
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 💳 Integração com Pagamentos

### Fluxo de Upgrade:
1. **Usuário escolhe plano** → Frontend
2. **Processa pagamento** → Stripe/PayPal
3. **Webhook confirma** → Atualiza subscription
4. **Permissões atualizadas** → Automaticamente

### Exemplo de Webhook:
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const event = await stripe.webhooks.constructEvent(...)
  
  if (event.type === 'checkout.session.completed') {
    await prisma.subscription.update({
      where: { userId: event.data.object.client_reference_id },
      data: {
        plan: 'premium',
        status: 'active',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
  }
}
```

## 🎛️ Alternativas Avançadas

### Opção 2: Row Level Security (RLS) do Supabase
```sql
-- Políticas baseadas em metadados do usuário
CREATE POLICY "Users can only see own data" ON cultivations
  FOR ALL USING (
    user_id = auth.uid() AND
    (auth.jwt() ->> 'user_metadata' ->> 'plan') IN ('premium', 'enterprise')
  );
```

### Opção 3: Supabase + Metadados
```typescript
// Armazenar plano nos metadados do Supabase Auth
await supabase.auth.updateUser({
  data: { 
    plan: 'premium',
    permissions: ['canAccessAnalytics', 'canExportData']
  }
})
```

## 🚀 Implementação Recomendada

### 1. Manter Sistema Atual
- ✅ Já funciona perfeitamente
- ✅ Flexível e escalável
- ✅ Fácil de manter

### 2. Melhorias Sugeridas:
```typescript
// Cache de permissões
const permissionsCache = new Map()

function getCachedPermissions(userId: string) {
  if (permissionsCache.has(userId)) {
    return permissionsCache.get(userId)
  }
  
  const permissions = calculatePermissions(userId)
  permissionsCache.set(userId, permissions)
  return permissions
}
```

### 3. Monitoramento:
```typescript
// Log de uso de permissões
function logPermissionUsage(userId: string, permission: string) {
  analytics.track('permission_used', {
    userId,
    permission,
    plan: user.subscription?.plan,
    timestamp: new Date()
  })
}
```

## 📈 Escalabilidade

### Para Grandes Volumes:
1. **Cache Redis**: Permissões em cache
2. **Background Jobs**: Processamento assíncrono
3. **Rate Limiting**: Por plano
4. **Analytics**: Uso por feature

### Exemplo com Redis:
```typescript
import { redis } from '@/lib/redis'

async function getUserPermissions(userId: string) {
  // Tentar cache primeiro
  const cached = await redis.get(`permissions:${userId}`)
  if (cached) return JSON.parse(cached)
  
  // Calcular e cachear
  const permissions = await calculatePermissions(userId)
  await redis.setex(`permissions:${userId}`, 300, JSON.stringify(permissions))
  
  return permissions
}
```

## 🎯 Conclusão

**O sistema atual é ideal porque:**
- ✅ Combina o melhor dos dois mundos
- ✅ Supabase Auth para autenticação robusta
- ✅ Controle total sobre lógica de negócio
- ✅ Fácil integração com pagamentos
- ✅ Permissões flexíveis e auditáveis

**Não precisa mudar nada!** O sistema está otimizado e pronto para produção.