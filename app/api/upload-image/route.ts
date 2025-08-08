import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { createRateLimitedHandler } from '@/lib/rate-limiter';

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB
const DATA_URL_REGEX = /^data:image\/(jpeg|jpg|png|webp|heic|heif);base64,/i;
const ALLOWED_FORMATS = ['jpg','jpeg','png','webp','heic','heif'];

function sanitizeName(name?: string) {
  if (!name) return 'image';
  return name.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 80) || 'image';
}

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

    const { image, filename, folder } = body as { image: string; filename?: string; folder?: string };

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Imagem não fornecida' }, { status: 400 });
    }

    // Validar data URL e tipo
    if (!DATA_URL_REGEX.test(image)) {
      return NextResponse.json({ error: 'Formato de imagem inválido. Use data URL (jpeg, png, webp, heic).' }, { status: 400 });
    }

    // Extrair payload base64 e estimar tamanho
    const base64Payload = image.replace(DATA_URL_REGEX, '');
    const approxBytes = Math.ceil((base64Payload.length * 3) / 4); // aproximação do tamanho
    if (approxBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Imagem deve ter no máximo 15MB.' }, { status: 400 });
    }

    // Credenciais Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Erro: Credenciais do Cloudinary não configuradas');
      return NextResponse.json({ error: 'Credenciais do Cloudinary não configuradas' }, { status: 500 });
    }

    const safeFolder = (folder || 'cultivations').replace(/[^a-zA-Z0-9-_\/]/g, '');
    const safeName = sanitizeName(filename);

    try {
      // Upload para Cloudinary (endurecido)
      const result = await uploadImage(image, safeFolder, {
        public_id: `${safeFolder}/${Date.now()}_${safeName}`,
        transformation: [
          { width: 1600, height: 1600, crop: 'limit' },
          { quality: 'auto' }
        ],
        resource_type: 'image',
        allowed_formats: ALLOWED_FORMATS,
        use_filename: false,
        unique_filename: true,
      } as any);

      console.log('5. Upload realizado com sucesso:', result.public_id);

      return NextResponse.json({
        success: true,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        filename: safeName,
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