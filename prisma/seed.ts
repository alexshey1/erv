import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Planos de assinatura
  const plans = [
    {
      plan: 'free',
      status: 'active',
      price: 0,
      currency: 'BRL',
      features: [
        'Até 3 cultivos',
        'Histórico básico',
        'Dashboard simples',
        '1GB de armazenamento',
      ],
    },
    {
      plan: 'basic',
      status: 'active',
      price: 29.90,
      currency: 'BRL',
      features: [
        'Até 10 cultivos',
        'Dashboard completo',
        'Histórico detalhado',
        'Comparação de cultivos',
        'Exportação de dados',
        'Compartilhamento',
        '5GB de armazenamento',
      ],
    },
    {
      plan: 'premium',
      status: 'active',
      price: 79.90,
      currency: 'BRL',
      features: [
        'Até 50 cultivos',
        'Analytics avançado',
        'Relatórios customizados',
        'Detecção de anomalias',
        'Dados em tempo real',
        'Analytics preditivo',
        'API access',
        '20GB de armazenamento',
      ],
    },
    {
      plan: 'enterprise',
      status: 'active',
      price: 199.90,
      currency: 'BRL',
      features: [
        'Cultivos ilimitados',
        'Todas as funcionalidades',
        'Recursos de equipe',
        'Suporte prioritário',
        'Analytics enterprise',
        '100GB de armazenamento',
      ],
    },
  ]

  for (const plan of plans) {
    await prisma.subscription.upsert({
      where: { 
        id: `${plan.plan}-default`
      },
      update: {
        ...plan,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        autoRenew: true,
      },
      create: {
        id: `${plan.plan}-default`,
        ...plan,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        userId: 'default-user', // ID de usuário padrão
      },
    })
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 