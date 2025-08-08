# 📸 Sistema de Upload de Imagens

## 🚀 Configuração

### 1. **Cloudinary Setup**
- ✅ SDK instalado: `npm install cloudinary`
- ✅ Configuração em `lib/cloudinary.ts`
- ✅ API route em `app/api/upload-image/route.ts`

### 2. **Banco de Dados**
- ✅ Tabela `cultivation_images` criada
- ✅ Relacionamentos configurados
- ✅ Migração aplicada

## 🔧 Como Usar

### **1. Componente de Upload**
```tsx
import { ImageUpload } from '@/components/forms/image-upload';

function MyComponent() {
  const handleImagesUploaded = (images) => {
    console.log('Imagens enviadas:', images);
    // Salvar no banco de dados
  };

  return (
    <ImageUpload 
      onImagesUploaded={handleImagesUploaded}
      maxImages={5}
      acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
    />
  );
}
```

### **2. Salvar no Banco**
```tsx
import { prisma } from '@/lib/prisma';

// Salvar imagens de um cultivo
const savedImages = await prisma.cultivationImage.createMany({
  data: uploadedImages.map(img => ({
    publicId: img.publicId,
    secureUrl: img.secureUrl,
    filename: img.filename,
    fileSize: img.fileSize,
    mimeType: img.mimeType,
    width: img.width,
    height: img.height,
    format: img.format,
    cultivationId: 'cultivation-id'
  }))
});
```

### **3. Buscar Imagens**
```tsx
// Buscar imagens de um cultivo
const images = await prisma.cultivationImage.findMany({
  where: { cultivationId: 'cultivation-id' },
  orderBy: { createdAt: 'desc' }
});
```

## 📋 Funcionalidades

### ✅ **Implementado**
- [x] Upload múltiplo de imagens
- [x] Validação de tipos de arquivo
- [x] Validação de tamanho (máximo 5MB)
- [x] Redimensionamento automático (800x600)
- [x] Compressão automática
- [x] Preview das imagens
- [x] Remoção de imagens
- [x] Integração com Cloudinary
- [x] Armazenamento no banco PostgreSQL

### 🔄 **Próximos Passos**
- [ ] Upload de imagens em eventos da timeline
- [ ] Galeria de imagens por cultivo
- [ ] Modal de visualização em tela cheia
- [ ] Drag & drop para reordenar
- [ ] Crop de imagens
- [ ] Filtros por data/tipo

## 🔑 Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME="cloudinary_3d_db0497dd-4559-4797-a931-3864f837c64d"
CLOUDINARY_API_KEY="sua_api_key_aqui"
CLOUDINARY_API_SECRET="seu_api_secret_aqui"
```

## 📊 Estrutura do Banco

```sql
-- Tabela de imagens
CREATE TABLE cultivation_images (
  id VARCHAR(25) PRIMARY KEY,
  public_id VARCHAR(255) UNIQUE NOT NULL,
  secure_url VARCHAR(500) NOT NULL,
  filename VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  format VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Relacionamentos
  cultivation_id VARCHAR(25) REFERENCES cultivations(id) ON DELETE CASCADE,
  event_id VARCHAR(25) REFERENCES cultivation_events(id) ON DELETE SET NULL
);
```

## 🎯 Exemplo de Uso Completo

```tsx
'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/forms/image-upload';
import { Button } from '@/components/ui/button';

export function CultivationForm() {
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Salvar cultivo
    const cultivation = await fetch('/api/cultivations', {
      method: 'POST',
      body: JSON.stringify({ name: 'Meu Cultivo' })
    });

    // Salvar imagens
    if (images.length > 0) {
      await fetch('/api/cultivations/images', {
        method: 'POST',
        body: JSON.stringify({
          cultivationId: cultivation.id,
          images: images
        })
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ImageUpload onImagesUploaded={setImages} />
      <Button type="submit">Salvar Cultivo</Button>
    </form>
  );
}
```

## 🚨 Limitações Atuais

1. **API Keys**: Você precisa adicionar suas próprias API keys do Cloudinary
2. **Tamanho**: Máximo 5MB por imagem
3. **Tipos**: Apenas JPEG, PNG e WebP
4. **Quantidade**: Máximo 5 imagens por upload

## 🔧 Troubleshooting

### **Erro de Upload**
- Verifique se as API keys do Cloudinary estão configuradas
- Confirme se o arquivo não excede 5MB
- Verifique se o tipo de arquivo é suportado

### **Erro de Banco**
- Execute `npm run db:migrate` para aplicar migrações
- Verifique se a conexão com o banco está funcionando

### **Erro de Permissão**
- No Windows, pode ser necessário executar como administrador
- Tente deletar a pasta `.prisma` e regenerar 