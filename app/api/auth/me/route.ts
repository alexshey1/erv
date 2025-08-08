import { NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions-supabase';
import { cookies } from 'next/headers';
import type { SubscriptionPlan } from '@/types/auth';

export async function GET() {
  try {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  console.log('auth_token:', token);

  const userJwt = getUserFromCookie(cookieStore);
  console.log('userJwt:', userJwt);

  if (!userJwt) {
    return NextResponse.json({ user: null });
  }
    
    const dbUser = await prisma.user.findUnique({ 
      where: { id: userJwt.userId },
      include: {
        subscription: true,
        cultivations: {
          select: { id: true }
        }
      }
    });
    
    if (!dbUser) {
      return NextResponse.json({ user: null });
    }

    // Calcular permissões
    const permissions = getUserPermissions(dbUser);

  return NextResponse.json({
    user: {
      id: dbUser.id,
      name: dbUser.name || '',
      email: dbUser.email || '',
      role: dbUser.role,
      permissions,
      subscription: dbUser.subscription,
      cultivationCount: dbUser.cultivations.length,
      // Informações adicionais úteis
      canCreateMoreCultivations: dbUser.cultivations.length < (permissions.maxCultivations === -1 ? Infinity : permissions.maxCultivations),
    }
  });
  } catch (error) {
    console.error('Erro na rota /api/auth/me:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
} 