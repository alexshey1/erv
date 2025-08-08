# Configuração do Supabase

## 1. Configurações de Email Templates

Vá para **Authentication > Email Templates** no dashboard do Supabase:

### 1.1 Confirm Signup Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirme sua conta - ErvApp</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f0fdf4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; margin-bottom: 10px; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 20px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌱</div>
            <h1>Bem-vindo ao ErvApp!</h1>
        </div>
        <div class="content">
            <h2>Confirme sua conta</h2>
            <p>Olá! Obrigado por se registrar no ErvApp, sua plataforma completa para gerenciamento de cultivos.</p>
            <p>Para ativar sua conta e começar a usar todas as funcionalidades, clique no botão abaixo:</p>
            <p style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Confirmar Conta</a>
            </p>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">{{ .ConfirmationURL }}</p>
            <p><strong>Este link expira em 24 horas.</strong></p>
            <p>Se você não criou uma conta no ErvApp, pode ignorar este email.</p>
        </div>
        <div class="footer">
            <p>© 2024 ErvApp - Sua plataforma de cultivo inteligente</p>
            <p>Este é um email automático, não responda.</p>
        </div>
    </div>
</body>
</html>
```

### 1.2 Reset Password Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir Senha - ErvApp</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f0fdf4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; margin-bottom: 10px; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 20px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .warning { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔒</div>
            <h1>Redefinir Senha</h1>
        </div>
        <div class="content">
            <h2>Solicitação de nova senha</h2>
            <p>Olá! Recebemos uma solicitação para redefinir a senha da sua conta no ErvApp.</p>
            <p>Para criar uma nova senha, clique no botão abaixo:</p>
            <p style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Redefinir Senha</a>
            </p>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">{{ .ConfirmationURL }}</p>
            <div class="warning">
                <p><strong>⚠️ Importante:</strong></p>
                <ul>
                    <li>Este link expira em 1 hora</li>
                    <li>Se você não solicitou esta alteração, ignore este email</li>
                    <li>Sua senha atual permanece ativa até você criar uma nova</li>
                </ul>
            </div>
        </div>
        <div class="footer">
            <p>© 2024 ErvApp - Sua plataforma de cultivo inteligente</p>
            <p>Este é um email automático, não responda.</p>
        </div>
    </div>
</body>
</html>
```

### 1.3 Magic Link Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Mágico - ErvApp</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f0fdf4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #7c3aed, #5b21b6); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; margin-bottom: 10px; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 20px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✨</div>
            <h1>Login Mágico</h1>
        </div>
        <div class="content">
            <h2>Acesse sua conta sem senha</h2>
            <p>Olá! Clique no botão abaixo para fazer login na sua conta ErvApp sem precisar digitar sua senha:</p>
            <p style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Fazer Login</a>
            </p>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">{{ .ConfirmationURL }}</p>
            <p><strong>Este link expira em 5 minutos por segurança.</strong></p>
            <p>Se você não solicitou este login, pode ignorar este email.</p>
        </div>
        <div class="footer">
            <p>© 2024 ErvApp - Sua plataforma de cultivo inteligente</p>
            <p>Este é um email automático, não responda.</p>
        </div>
    </div>
</body>
</html>
```

## 2. URL Configuration

Em **Authentication > Settings**:

### Site URL
```
http://localhost:3000
```

### Redirect URLs
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
https://seudominio.com/auth/callback
https://seudominio.com/auth/reset-password
```

### Additional Redirect URLs (para OAuth)
```
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
https://seudominio.com/auth/callback
https://seudominio.com/dashboard
```

## 3. Configurações de Segurança

### Disable signup
- ✅ **Enable email confirmations**: false (você controla isso)
- ✅ **Enable phone confirmations**: false

### Password Settings
- **Minimum password length**: 6
- **Password requirements**: Deixar padrão

## 4. SMTP (Opcional)

Se quiser usar seu próprio provedor de email:

### Gmail
```
Host: smtp.gmail.com
Port: 587
Username: seu-email@gmail.com
Password: sua-app-password
```

### SendGrid
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: sua-api-key
```

## 5. Row Level Security (RLS)

Para ativar RLS nas suas tabelas:

```sql
-- Ativar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_events ENABLE ROW LEVEL SECURITY;

-- Policies básicas (opcional)
CREATE POLICY "Users can view own data" ON cultivations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own events" ON cultivation_events
  FOR ALL USING (user_id = auth.uid());
```

## 6. Variáveis de Ambiente

Seu `.env` deve ficar assim:

```env
# Database - Configuração com Pooled e Direct Connection
# Pooled connection para transações normais
DATABASE_URL=postgresql://postgres:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
# Direct connection para migrações e operações especiais
DIRECT_URL=postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_ID.supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Resto das suas variáveis...
JWT_SECRET=seu_jwt_secret
CLOUDINARY_CLOUD_NAME=seu_cloudinary
# etc...
```

### Explicação das URLs:

- **DATABASE_URL**: Usa connection pooling (porta 6543) para operações normais da aplicação
- **DIRECT_URL**: Usa conexão direta (porta 5432) para migrações do Prisma e operações que precisam de conexão direta