# 📧 Configuração de Email Templates no Supabase

## 🚀 Passo a Passo

### 1. **Acessar o Dashboard**
1. Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `wvpkowxczcjlmyjpyxyi`
3. No menu lateral, clique em **Authentication**
4. Clique em **Email Templates**

### 2. **Configurar Templates**

#### 2.1 **Confirm Signup (Confirmação de Conta)**
- Clique em **Confirm signup**
- Cole o template HTML do arquivo `supabase-config.md`
- **Subject**: `Confirme sua conta - ErvApp 🌱`

#### 2.2 **Reset Password (Redefinir Senha)**
- Clique em **Reset password**
- Cole o template HTML do arquivo `supabase-config.md`
- **Subject**: `Redefinir senha - ErvApp 🔒`

#### 2.3 **Magic Link (Login Mágico)**
- Clique em **Magic Link**
- Cole o template HTML do arquivo `supabase-config.md`
- **Subject**: `Seu link de acesso - ErvApp ✨`

### 3. **Configurar URLs de Redirecionamento**

#### 3.1 **Site URL**
```
http://localhost:3000
```

#### 3.2 **Redirect URLs**
Adicione estas URLs (uma por linha):
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
http://localhost:3000/dashboard
https://seudominio.com/auth/callback
https://seudominio.com/auth/reset-password
https://seudominio.com/dashboard
```

### 4. **Configurar OAuth (Opcional)**

#### 4.1 **Google OAuth**
1. Vá para **Authentication > Providers**
2. Clique em **Google**
3. Ative o provider
4. Adicione suas credenciais:
   - **Client ID**: (do Google Console)
   - **Client Secret**: (do Google Console)

#### 4.2 **GitHub OAuth**
1. Clique em **GitHub**
2. Ative o provider
3. Adicione suas credenciais:
   - **Client ID**: (do GitHub)
   - **Client Secret**: (do GitHub)

### 5. **Configurações de Segurança**

#### 5.1 **Email Settings**
- ✅ **Enable email confirmations**: true
- ✅ **Enable phone confirmations**: false
- ✅ **Double confirm email changes**: true
- ✅ **Secure email change**: true

#### 5.2 **Password Settings**
- **Minimum password length**: 6
- ✅ **Require uppercase**: true
- ✅ **Require lowercase**: true
- ✅ **Require numbers**: true
- ✅ **Require special characters**: false

### 6. **SMTP Customizado (Opcional)**

Para usar seu próprio provedor de email:

#### 6.1 **Gmail**
```
Host: smtp.gmail.com
Port: 587
Username: seu-email@gmail.com
Password: sua-app-password
```

#### 6.2 **SendGrid**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: sua-api-key
```

### 7. **Testar Configuração**

#### 7.1 **Teste de Registro**
1. Acesse `http://localhost:3000/auth/register`
2. Crie uma conta de teste
3. Verifique se o email de confirmação chegou
4. Clique no link de confirmação

#### 7.2 **Teste de Reset**
1. Acesse `http://localhost:3000/auth/forgot-password`
2. Digite um email válido
3. Verifique se o email de reset chegou
4. Clique no link e redefina a senha

#### 7.3 **Teste de OAuth**
1. Acesse `http://localhost:3000/auth/login`
2. Clique em "Continuar com Google"
3. Verifique se o login funciona

### 8. **Variáveis Disponíveis nos Templates**

#### Para todos os templates:
- `{{ .SiteURL }}` - URL do seu site
- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Token }}` - Token de verificação
- `{{ .TokenHash }}` - Hash do token

#### Para templates customizados:
- `{{ .Email }}` - Email do usuário
- `{{ .Name }}` - Nome do usuário (se disponível)

### 9. **Troubleshooting**

#### Emails não chegam:
- ✅ Verificar spam/lixo eletrônico
- ✅ Verificar se as URLs estão corretas
- ✅ Verificar logs no Supabase Dashboard

#### OAuth não funciona:
- ✅ Verificar credenciais do provider
- ✅ Verificar URLs de callback
- ✅ Verificar se o provider está ativo

#### Templates não aparecem:
- ✅ Verificar se salvou as alterações
- ✅ Verificar sintaxe HTML
- ✅ Testar com email real

### 10. **Próximos Passos**

Após configurar tudo:

1. **Teste em produção** com domínio real
2. **Configure monitoramento** de emails
3. **Implemente analytics** de abertura
4. **Adicione mais providers** OAuth se necessário

## 🎉 Pronto!

Seu sistema de email está configurado e funcionando! Os usuários agora receberão emails bonitos e profissionais em todas as interações com sua aplicação.