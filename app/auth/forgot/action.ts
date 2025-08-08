import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { ActionResponse } from '@/types/actions';

const forgotSchema = z.object({
  email: z.string().email()
});

type ForgotInput = z.infer<typeof forgotSchema>;

const actionClient = createSafeActionClient();

export const forgotPassword = actionClient.action(async (input: unknown): Promise<ActionResponse> => {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos.' };
  }
  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: 'E-mail não encontrado.' };
  }
  // Aqui você geraria e enviaria o token por e-mail
  return { success: true };
}); 