import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { createRateLimitedHandler } from '@/lib/rate-limiter';

async function uploadHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  console.log('=== ROTA UPLOAD CHAMADA ===');
  
  try {
    console.log('1. Iniciando upload de imagem...');
    
    const body = await request.json();
    console.log('2. Body recebido:', {
      hasImage: !!body.image,
      hasFilename: !!body.filename,
      hasFolder: !!body.folder
    });

    const { image, filename, folder } = body;

    if (!image) {
      console.log('Erro: Imagem não fornecida');
      return NextResponse.json(
        { error: 'Imagem não fornecida' },
        { status: 400 }
      );
    }

    console.log('3. Configurações Cloudinary:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'não definida',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'não definida'
    });

    // Verificar se as credenciais estão configuradas
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Erro: Credenciais do Cloudinary não configuradas');
      return NextResponse.json(
        { error: 'Credenciais do Cloudinary não configuradas' },
        { status: 500 }
      );
    }

    console.log('4. Chamando uploadImage...');
    
    try {
      // Upload para Cloudinary
      const result = await uploadImage(image, folder || 'cultivations', {
        public_id: `${folder || 'cultivations'}/${Date.now()}_${filename?.replace(/\.[^/.]+$/, '') || 'image'}`,
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      console.log('5. Upload realizado com sucesso:', result.public_id);

      return NextResponse.json({
        success: true,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        filename: filename || 'image',
        fileSize: result.bytes,
        mimeType: `image/${result.format}`,
        width: result.width,
        height: result.height,
        format: result.format
      });
    } catch (uploadError) {
      console.error('6. Erro específico no uploadImage:', uploadError);
      return NextResponse.json(
        { error: uploadError instanceof Error ? uploadError.message : 'Erro no upload para Cloudinary' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('7. Erro geral no upload:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Aplicar rate limiting: 5 uploads por minuto por usuário
export const POST = createRateLimitedHandler('upload', uploadHandler);