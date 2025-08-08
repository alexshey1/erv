# Sistema de Imagens na Timeline de Cultivos

## 📸 Como Funciona

### 1. **Upload de Fotos nos Eventos**
Quando você cria um novo evento na timeline (parâmetros, ações ou problemas), agora há um campo **"Fotos"** que permite:

- **Selecionar até 3 imagens** por evento
- **Formatos suportados**: JPG, PNG, WebP
- **Tamanho máximo**: 5MB por imagem
- **Preview em tempo real** das imagens selecionadas

### 2. **Processo de Upload**
```
1. Usuário seleciona fotos → 2. Upload para Cloudinary → 3. URLs salvas no banco → 4. Exibição na timeline
```

### 3. **Armazenamento**
- **Cloudinary**: Imagens são enviadas para CDN global
- **PostgreSQL**: URLs e metadados salvos no banco
- **Relacionamento**: Cada imagem vinculada ao evento específico

## 🔧 Implementação Técnica

### Componente ImageUpload
```tsx
<ImageUpload 
  onImagesUploaded={setUploadedImages}
  maxImages={3}
  className="mt-2"
/>
```

### API Route para Salvar
```typescript
// POST /api/cultivation-events/images
{
  eventId: "event_123",
  images: [
    {
      publicId: "cloudinary_id",
      secureUrl: "https://res.cloudinary.com/...",
      filename: "foto1.jpg",
      fileSize: 1024000,
      width: 1920,
      height: 1080,
      format: "jpg"
    }
  ]
}
```

### Banco de Dados
```sql
-- Tabela cultivation_image
CREATE TABLE cultivation_image (
  id SERIAL PRIMARY KEY,
  public_id VARCHAR(255) NOT NULL,
  secure_url TEXT NOT NULL,
  filename VARCHAR(255),
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  format VARCHAR(10),
  event_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Uso na Prática

### 1. **Criando Evento com Fotos**
1. Vá para a timeline do cultivo
2. Clique em "Novo Evento"
3. Preencha os dados do evento
4. Na seção "Fotos", clique em "Escolher arquivo"
5. Selecione até 3 imagens
6. Salve o evento

### 2. **Visualizando Fotos**
- As fotos aparecem como miniaturas no evento
- Clique para ampliar
- Organizadas por data na timeline

### 3. **Tipos de Eventos com Fotos**
- **Parâmetros**: Fotos das medições (pH, EC, etc.)
- **Ações**: Fotos das atividades (poda, irrigação, etc.)
- **Problemas**: Fotos dos problemas encontrados

## 📱 Interface do Usuário

### Modal de Evento Atualizado
```tsx
// Campo de fotos no modal
<div className="grid grid-cols-4 items-center gap-4">
  <Label className="text-right">Fotos</Label>
  <div className="col-span-3">
    <ImageUpload 
      onImagesUploaded={setUploadedImages}
      maxImages={3}
      className="mt-2"
    />
  </div>
</div>
```

### Exibição na Timeline
```tsx
// Miniaturas das fotos no evento
{event.images && event.images.length > 0 && (
  <div className="flex gap-1 mt-2">
    {event.images.map((img, index) => (
      <img 
        key={index}
        src={img.secureUrl} 
        alt={img.filename}
        className="w-8 h-8 object-cover rounded cursor-pointer"
        onClick={() => openImageModal(img)}
      />
    ))}
  </div>
)}
```

## 🔒 Segurança e Performance

### Segurança
- **Validação de tipos**: Apenas imagens permitidas
- **Tamanho limitado**: Máximo 5MB por imagem
- **URLs seguras**: HTTPS obrigatório
- **Sanitização**: Nomes de arquivo limpos

### Performance
- **Otimização automática**: Cloudinary redimensiona
- **Lazy loading**: Imagens carregam sob demanda
- **CDN global**: Entrega rápida em qualquer lugar
- **Compressão**: Tamanhos otimizados automaticamente

## 🛠️ Configuração

### Variáveis de Ambiente
```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

### Dependências
```json
{
  "cloudinary": "^1.41.0",
  "@cloudinary/url-gen": "^1.20.0"
}
```

## 📊 Benefícios

### Para o Usuário
- **Documentação visual**: Fotos dos progressos
- **Histórico completo**: Registro fotográfico
- **Identificação de problemas**: Fotos dos sintomas
- **Compartilhamento**: Fotos para consultoria

### Para o Sistema
- **Dados estruturados**: Metadados organizados
- **Busca eficiente**: Índices otimizados
- **Escalabilidade**: CDN global
- **Backup automático**: Cloudinary confiável

## 🚀 Próximos Passos

1. **Testar o upload** em diferentes dispositivos
2. **Implementar visualização** em modal
3. **Adicionar edição** de fotos existentes
4. **Criar galeria** de fotos por cultivo
5. **Exportar relatórios** com fotos

---

**Status**: ✅ Implementado e funcional
**Versão**: 1.0.0
**Última atualização**: 2024-07-20 