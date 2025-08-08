import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpkrlvo1j',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImage(
  file: Buffer | string,
  folder: string = 'cultivations',
  options: {
    transformation?: any[];
    public_id?: string;
  } = {}
): Promise<UploadResult> {
  try {
    console.log('Iniciando upload para Cloudinary...');

    // Verificar se as credenciais estão configuradas
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Credenciais do Cloudinary não configuradas');
    }

    const uploadOptions = {
      folder,
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ],
      ...options
    };

    console.log('Fazendo upload para Cloudinary...');
    const result = await cloudinary.uploader.upload(file as string, uploadOptions);
    
    console.log('Upload realizado com sucesso:', result.public_id);
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Erro no upload para Cloudinary:', error);
    
    if (error instanceof Error) {
      throw new Error(`Falha no upload da imagem: ${error.message}`);
    } else {
      throw new Error('Falha no upload da imagem');
    }
  }
}

export async function deleteImage(public_id: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error('Erro ao deletar imagem do Cloudinary:', error);
    throw new Error('Falha ao deletar imagem');
  }
}

export function getImageUrl(public_id: string, transformation?: any[]): string {
  if (transformation) {
    return cloudinary.url(public_id, { transformation });
  }
  return cloudinary.url(public_id);
} 