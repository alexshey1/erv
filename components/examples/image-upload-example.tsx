'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/forms/image-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ImageUploadExample() {
  const [uploadedImages, setUploadedImages] = useState<Array<{
    publicId: string;
    secureUrl: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    format: string;
  }>>([]);

  const handleImagesUploaded = (images: Array<{
    publicId: string;
    secureUrl: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    format: string;
  }>) => {
    setUploadedImages(images);
    console.log('Imagens enviadas:', images);
  };

  const handleSave = () => {
    // Aqui você salvaria as imagens no banco de dados
    console.log('Salvando imagens:', uploadedImages);
    
    // Exemplo de como salvar no banco:
    // await prisma.cultivationImage.createMany({
    //   data: uploadedImages.map(img => ({
    //     publicId: img.publicId,
    //     secureUrl: img.secureUrl,
    //     filename: img.filename,
    //     fileSize: img.fileSize,
    //     mimeType: img.mimeType,
    //     width: img.width,
    //     height: img.height,
    //     format: img.format,
    //     cultivationId: 'cultivation-id'
    //   }))
    // });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Imagens - Exemplo</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload 
            onImagesUploaded={handleImagesUploaded}
            maxImages={5}
          />
        </CardContent>
      </Card>

      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imagens Selecionadas ({uploadedImages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={image.publicId} className="space-y-2">
                  <img
                    src={image.secureUrl}
                    alt={image.filename}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium">{image.filename}</p>
                    <p>{image.width}x{image.height} • {image.format}</p>
                    <p>{(image.fileSize / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <Button onClick={handleSave}>
                Salvar Imagens no Banco
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 