# Sistema de Permissões Multi-Nível - ErvApp

## 🚀 Como Configurar

### 1. Executar Migração do Banco de Dados

```bash
# Instalar dependências se necessário
npm install

# Executar migração e configurar banco
npm run db:setup
```

### 2. Usuários Criados Automaticamente

Após executar o setup, os seguintes usuários serão criados:

| Email | Senha | Role | Plano | Permissões |
|-------|-------|------|-------|------------|
| `admin@ervapp.com` | `admin123` | admin | Enterprise | **Todas** |
| `free@test.com` | `test123` | free | Free | Limitadas |
| `basic@test.com` | `test123` | basic | Basic | Intermediárias |
| `premium@test.com` | `test123` | premium | Premium | Avançadas |

## 👑 Usuário Admin

O usuário admin tem **todas as permissões**:

- **Email**: `admin@ervapp.com`
- **Senha**: `admin123`
- **Role**: `admin`
- **Plano**: Enterprise (gratuito para admin)
- **Permissões**: Ilimitadas

### Permissões do Admin:
- ✅ Acesso total a todas as funcionalidades
- ✅ Cultivos ilimitados
- ✅ Analytics avançado
- ✅ Relatórios customizados
- ✅ Detecção de anomalias
- ✅ API access
- ✅ Dados em tempo real
- ✅ Analytics preditivo
- ✅ Recursos de equipe
- ✅ Suporte prioritário

## 📊 Planos e Permissões

### Free (R$ 0,00/mês)
- ✅ Até 3 cultivos
- ✅ Dashboard básico
- ✅ Histórico simples
- ✅ 1GB de armazenamento

### Basic (R$ 29,90/mês)
- ✅ Até 10 cultivos
- ✅ Analytics básico
- ✅ Relatórios simples
- ✅ Exportação de dados
- ✅ Compartilhamento
- ✅ 5GB de armazenamento

### Premium (R$ 79,90/mês)
- ✅ Até 50 cultivos
- ✅ Analytics avançado
- ✅ Relatórios customizados
- ✅ Detecção de anomalias
- ✅ Dados em tempo real
- ✅ Analytics preditivo
- ✅ API access
- ✅ 20GB de armazenamento

### Enterprise (R$ 199,90/mês)
- ✅ Cultivos ilimitados
- ✅ Todas as funcionalidades
- ✅ Recursos de equipe
- ✅ Suporte prioritário
- ✅ Analytics enterprise
- ✅ 100GB de armazenamento

## 🔧 Como Usar no Código

### 1. Proteger Componentes

```tsx
import { PermissionGuard } from '@/components/auth/permission-guard'

// Proteger funcionalidade específica
<PermissionGuard user={user} permission="canAccessAnalytics">
  <AnalyticsComponent />
</PermissionGuard>
```

### 2. Verificar Permissões Programaticamente

```tsx
import { canAccess } from '@/lib/permissions'

if (canAccess(user, "canExportData")) {
  // Permitir exportação
}
```

### 3. Verificar Limites

```tsx
import { checkCultivationLimit } from '@/lib/permissions'

const canCreateMore = checkCultivationLimit(user, currentCultivationCount)
```

## 🛠️ Comandos Úteis

```bash
# Configurar banco de dados completo
npm run db:setup

# Apenas migração
npm run db:migrate

# Apenas gerar cliente Prisma
npm run db:generate

# Reset completo do banco
npm run db:reset

# Executar seed manualmente
npm run db:seed
```

## 🔍 Verificar Status

Para verificar se tudo está funcionando:

1. **Login como admin**: `admin@ervapp.com` / `admin123`
2. **Testar todas as funcionalidades** - deve ter acesso total
3. **Login como usuário free**: `free@test.com` / `test123`
4. **Verificar limitações** - algumas funcionalidades devem mostrar modal de upgrade

## 🚨 Troubleshooting

### Erro de Migração
```bash
# Se houver erro na migração
npm run db:reset
```

### Erro de Tipos TypeScript
```bash
# Regenerar tipos do Prisma
npm run db:generate
```

### Usuário Admin Não Funciona
```bash
# Recriar usuário admin
npm run db:seed
```

## 📝 Estrutura do Banco

### Tabela `users`
- `id`: ID único
- `email`: Email do usuário
- `name`: Nome do usuário
- `password`: Senha criptografada
- `role`: Role do usuário (free, basic, premium, enterprise, admin)
- `isEmailVerified`: Email verificado
- `lastLoginAt`: Último login
- `avatar`: Avatar do usuário

### Tabela `subscriptions`
- `id`: ID único
- `userId`: ID do usuário
- `plan`: Plano (free, basic, premium, enterprise)
- `status`: Status (active, cancelled, expired, trial)
- `startDate`: Data de início
- `endDate`: Data de fim
- `autoRenew`: Renovação automática
- `price`: Preço
- `currency`: Moeda
- `features`: Array de features

## 🎯 Próximos Passos

1. **Integrar com sistema de pagamento** (Stripe, PayPal, etc.)
2. **Implementar webhooks** para atualizar assinaturas
3. **Adicionar analytics de uso** por usuário
4. **Criar painel admin** para gerenciar usuários
5. **Implementar notificações** de expiração de assinatura 