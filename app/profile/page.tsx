import { cookies } from 'next/headers';
import { getUserFromCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from '@/components/auth/profile-form';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const userJwt = getUserFromCookie(cookieStore);
  let user: any = null;
  
  if (userJwt) {
    try {
      // Buscar usuário completo com dados da assinatura
      user = await prisma.user.findUnique({
        where: { id: userJwt.userId },
        include: { subscription: true }
      });
      
      // Se não encontrou o usuário, redirecionar para login
      if (!user) {
        redirect('/auth/login');
  }
      
      // Para depuração
      console.log('Usuário carregado:', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name || null
      }, null, 2));
      
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  } else {
    // Se não há token, redirecionar para login
    redirect('/auth/login');
  }
  
  return <ProfileForm user={user} />;
}