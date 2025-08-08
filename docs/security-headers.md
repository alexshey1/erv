# Headers de Segurança - Cultivation Dashboard

## 🛡️ Headers Implementados

### Content Security Policy (CSP)
Controla quais recursos podem ser carregados pela aplicação:

- **default-src 'self'**: Apenas recursos do próprio domínio por padrão
- **script-src**: Scripts permitidos (próprio domínio + Vercel + Sentry)
- **style-src**: Estilos permitidos (próprio domínio + Google Fonts)
- **img-src**: Imagens permitidas (Cloudinary, Unsplash, placeholders)
- **connect-src**: Conexões permitidas (Supabase, APIs externas, Upstash, Sentry)

### Proteção contra Ataques

#### X-Frame-Options: DENY
- Previne ataques de clickjacking
- Impede que a aplicação seja incorporada em iframes

#### X-Content-Type-Options: nosniff
- Previne ataques de MIME type sniffing
- Força o navegador a respeitar o Content-Type declarado

#### X-XSS-Protection: 1; mode=block
- Ativa proteção XSS do navegador
- Bloqueia a página se detectar XSS

### Políticas de Transporte

#### Strict-Transport-Security (HSTS)
- Força HTTPS por 1 ano
- Inclui subdomínios
- Habilitado para preload

#### Referrer-Policy
- Controla informações de referência enviadas
- `strict-origin-when-cross-origin` para máxima segurança

### Controle de Recursos

#### Permissions-Policy
Desabilita APIs sensíveis:
- Geolocalização
- Microfone
- Câmera
- Pagamentos
- USB
- Sensores

#### Cross-Origin Policies
- **COEP**: `credentialless` - Isolamento de recursos
- **COOP**: `same-origin` - Isolamento de contexto
- **CORP**: `cross-origin` - Compartilhamento controlado

## 🚀 Headers por Rota

### Todas as Rotas (`/(.*)`)
- Todos os headers de segurança básicos
- CSP completo
- Proteções XSS e clickjacking

### API Routes (`/api/(.*)`)
- Headers de segurança + específicos para API
- `Cache-Control: no-store` - Sem cache para APIs
- `X-Robots-Tag: noindex` - Não indexar APIs

### Arquivos Estáticos (`/_next/static/(.*)`)
- Cache longo (1 ano) para arquivos imutáveis
- Otimização de performance

### Imagens (`/(.*)\\.(png|jpg|...)`)
- Cache de 24 horas
- Otimização para recursos visuais

## 🔧 Configuração

Os headers estão configurados em `next.config.mjs`:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
    // ... outras configurações
  ]
}
```

## 🧪 Teste de Segurança

Para testar os headers:

1. **Ferramentas Online**:
   - [Security Headers](https://securityheaders.com/)
   - [Mozilla Observatory](https://observatory.mozilla.org/)

2. **DevTools**:
   - Abrir Network tab
   - Verificar Response Headers

3. **Comando curl**:
```bash
curl -I https://seu-dominio.vercel.app
```

## 📊 Score Esperado

Com esses headers, você deve obter:
- **Security Headers**: A+ 
- **Mozilla Observatory**: A+
- **Lighthouse Security**: 100/100

## 🔄 Manutenção

### Quando Atualizar:
- Adicionar novos domínios externos
- Integrar novas APIs
- Mudanças em CDNs
- Atualizações de segurança

### Monitoramento:
- Verificar logs de CSP violations
- Monitorar erros de CORS
- Testar após deploys

## ⚠️ Troubleshooting

### Problemas Comuns:

1. **Recursos Bloqueados**:
   - Verificar CSP
   - Adicionar domínio necessário

2. **CORS Errors**:
   - Verificar Cross-Origin policies
   - Ajustar connect-src

3. **Cache Issues**:
   - Verificar Cache-Control headers
   - Limpar cache do navegador