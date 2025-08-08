'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImageUploadProps {
  onImagesUploaded: (images: Array<{
    publicId: string;
    secureUrl: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    format: string;
  }>) => void;
  maxImages?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUpload({
  onImagesUploaded,
  maxImages = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > maxImages) {
      setError(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const newImages: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validar tipo de arquivo
        if (!acceptedTypes.includes(file.type)) {
          setError(`Tipo de arquivo não suportado: ${file.type}`);
          continue;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(`Arquivo muito grande: ${file.name}`);
          continue;
        }

        // Converter para base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Upload para Cloudinary
        console.log('Fazendo upload para Cloudinary...');
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64,
            filename: file.name,
            folder: 'cultivations'
          }),
        });

        console.log('Resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erro da API:', errorData);
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Upload bem-sucedido:', result);
        newImages.push(result);
      }

      const allImages = [...uploadedImages, ...newImages];
      setUploadedImages(allImages);
      onImagesUploaded(allImages);

    } catch (error) {
      console.error('Erro no upload:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer upload das imagens');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages, maxImages, acceptedTypes, onImagesUploaded]);

  const removeImage = useCallback((index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onImagesUploaded(newImages);
  }, [uploadedImages, onImagesUploaded]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="image-upload">Fotos do Cultivo</Label>
        <div className="mt-2">
          <Input
            id="image-upload"
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            disabled={isUploading || uploadedImages.length >= maxImages}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={isUploading || uploadedImages.length >= maxImages}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Fazendo upload...' : `Selecionar Imagens (${uploadedImages.length}/${maxImages})`}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <Card key={image.publicId} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <img
                    src={image.secureUrl}
                    alt={image.filename}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground truncate">
                  {image.filename}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {uploadedImages.length === 0 && !isUploading && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhuma imagem selecionada
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Clique no botão acima para adicionar fotos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}