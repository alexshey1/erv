import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Para server-side

// Cliente para operações server-side (envio de emails)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Helper para usar apenas o sistema de email do Supabase
export class SupabaseEmailHelper {

    // Enviar email de reset usando Supabase
    static async sendPasswordResetEmail(email: string) {
        try {
            const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
            })

            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Erro ao enviar email de reset:', error)
            return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
        }
    }

    // Verificar token de reset do Supabase
    static async verifyResetToken(token: string) {
        try {
            const { data, error } = await supabaseAdmin.auth.verifyOtp({
                token_hash: token,
                type: 'recovery'
            })

            if (error) throw error
            return { success: true, email: data.user?.email }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
        }
    }

    // Enviar email de verificação
    static async sendVerificationEmail(email: string) {
        try {
            const { error } = await supabaseAdmin.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: false // Não criar usuário, só enviar email
                }
            })

            if (error) throw error
            return { success: true }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
        }
    }
}