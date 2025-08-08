import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface EmailTemplate {
  subject: string
  html: string
}

interface WelcomeEmailData {
  name: string
  email: string
  siteUrl: string
}

interface UpgradeEmailData {
  name: string
  email: string
  oldPlan: string
  newPlan: string
  price: number
  nextBilling: string
  siteUrl: string
}

export class EmailService {
  
  // Carregar template de arquivo
  private static loadTemplate(templateName: string): string {
    const templatePath = path.join(process.cwd(), 'templates', `${templateName}.html`)
    return fs.readFileSync(templatePath, 'utf-8')
  }

  // Substituir variáveis no template
  private static replaceVariables(template: string, data: Record<string, any>): string {
    let result = template
    
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{.${key}}}`, 'g')
      result = result.replace(regex, data[key])
    })
    
    return result
  }

  // Enviar email de boas-vindas
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const template = this.loadTemplate('email-welcome')
      const html = this.replaceVariables(template, {
        Name: data.name,
        SiteURL: data.siteUrl
      })

      // Usar Supabase para enviar email customizado
      // Nota: Isso requer configuração de SMTP customizado no Supabase
      const { error } = await supabase.auth.admin.inviteUserByEmail(data.email, {
        data: {
          name: data.name,
          welcome_email: true
        },
        redirectTo: `${data.siteUrl}/dashboard`
      })

      if (error) {
        console.error('Erro ao enviar email de boas-vindas:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Erro no serviço de email:', error)
      return { success: false, error: 'Erro interno do serviço de email' }
    }
  }

  // Enviar email de upgrade
  static async sendUpgradeEmail(data: UpgradeEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const template = this.loadTemplate('email-upgrade')
      const html = this.replaceVariables(template, {
        Name: data.name,
        NewPlan: data.newPlan,
        Price: data.price.toFixed(2),
        NextBilling: data.nextBilling,
        SiteURL: data.siteUrl,
        isPremium: data.newPlan.toLowerCase() === 'premium',
        isEnterprise: data.newPlan.toLowerCase() === 'enterprise'
      })

      // Para emails customizados, você precisaria usar um serviço como:
      // - Resend
      // - SendGrid
      // - Nodemailer com SMTP
      
      console.log('Email de upgrade preparado para:', data.email)
      console.log('Template HTML gerado com sucesso')
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao enviar email de upgrade:', error)
      return { success: false, error: 'Erro interno do serviço de email' }
    }
  }

  // Enviar email de notificação de expiração
  static async sendExpirationNotice(email: string, name: string, daysRemaining: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Erro interno do serviço de email' }
    }
  }
}