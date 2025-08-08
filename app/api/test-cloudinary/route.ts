import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TESTE CLOUDINARY ===');
    
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpkrlvo1j',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    });

    console.log('Configurações:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'não definida',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'não definida'
    });

    // Testar apenas a configuração, sem fazer upload
    console.log('Testando configuração...');
    
    // Verificar se as credenciais estão configuradas
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais do Cloudinary não configuradas'
      }, { status: 500 });
    }

    // Testar upload simples sem opções complexas
    const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    console.log('Fazendo upload de teste simples...');
    const result = await cloudinary.uploader.upload(testImage);
    
    console.log('Upload de teste realizado:', result.public_id);

    return NextResponse.json({
      success: true,
      message: 'Cloudinary está funcionando',
      publicId: result.public_id,
      secureUrl: result.secure_url
    });

  } catch (error) {
    console.error('Erro no teste do Cloudinary:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error
    }, { status: 500 });
  }
} 