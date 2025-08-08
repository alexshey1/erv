# Guia de Migração para Supabase

## 1. Configurar .env

Copie seu `.env.example` para `.env` e preencha com os dados do Supabase:

```env
# Database URLs do Supabase - Nova configuração com Pooled + Direct
# Pooled connection para transações normais (porta 6543)
DATABASE_URL=postgresql://postgres:SUA_SENHA_DB@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Direct connection para migrações e operações especiais (porta 5432)
DIRECT_URL=postgresql://postgres:SUA_SENHA_DB@db.SEU_PROJECT_ID.supabase.co:5432/postgres

# Supabase Keys (pegar em Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Explicação das URLs:
- **DATABASE_URL**: Connection pooling para melhor performance em produção
- **DIRECT_URL**: Conexão direta necessária para migrações do Prisma

## 2. Migrar Schema

Execute os comandos na ordem:

```bash
# 1. Gerar o cliente Prisma
npx prisma generate

# 2. Fazer push do schema para Supabase
npx prisma db push

# 3. Verificar se deu certo
npx prisma studio
```

## 3. Configurar Auth no Supabase

No painel do Supabase, vá em **Authentication > Settings**:

### Email Templates
- **Confirm signup**: Desabilitar (você não usa)
- **Reset password**: Personalizar template
- **Magic Link**: Desabilitar

### URL Configuration
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: 
  - `http://localhost:3000/auth/reset-password`
  - `https://seudominio.com/auth/reset-password` (produção)

### SMTP Settings (Opcional)
Se quiser usar seu próprio email:
- **Enable custom SMTP**: true
- Configure com Gmail, SendGrid, etc.

## 4. Testar

```bash
# Testar conexão
npm run dev

# Testar reset de senha
# 1. Ir para /auth/forgot
# 2. Inserir email
# 3. Verificar se chegou email
# 4. Clicar no link do email
# 5. Redefinir senha
```

## 5. Migrar Dados (se necessário)

Se você já tem dados em produção:

```bash
# Exportar dados atuais
pg_dump sua_database_atual > backup.sql

# Importar no Supabase
psql "postgresql://postgres:senha@db.projeto.supabase.co:5432/postgres" < backup.sql
```

## 6. Row Level Security (Opcional)

Para usar RLS do Supabase, adicione policies:

```sql
-- Exemplo: usuários só veem seus próprios dados
ALTER TABLE cultivations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cultivations" ON cultivations
  FOR SELECT USING (user_id = auth.uid());
```

## Troubleshooting

### Erro de conexão:
- Verificar se DATABASE_URL e DIRECT_URL estão corretos
- DATABASE_URL deve usar porta 6543 (pooled connection)
- DIRECT_URL deve usar porta 5432 (direct connection)
- Verificar se senha do banco está certa

### Email não chega:
- Verificar spam
- Verificar configuração de redirect URLs
- Verificar se SUPABASE_SERVICE_ROLE_KEY está correto

### Schema não sincroniza:
```bash
npx prisma db push --force-reset
```