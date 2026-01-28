const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando atualização dos planos...')

  const plans = [
    {
      name: 'Básico',
      slug: 'basico',
      price: 19.90,
      features: { 
        max_users: 1, 
        whatsapp: false, 
        reports: false, 
        waiting_list: false, 
        reviews: false 
      }
    },
    {
      name: 'Profissional',
      slug: 'profissional',
      price: 29.90,
      features: { 
        max_users: 3, 
        whatsapp: true, 
        reports: false, 
        waiting_list: false, 
        reviews: false 
      }
    },
    {
      name: 'Avançado',
      slug: 'avancado',
      price: 49.90,
      features: { 
        max_users: 5, 
        whatsapp: true, 
        reports: true, 
        waiting_list: true, 
        reviews: true 
      }
    },
    {
      name: 'Premium',
      slug: 'premium',
      price: 69.90,
      features: { 
        max_users: 999, 
        whatsapp: true, 
        reports: true, 
        waiting_list: true, 
        reviews: true, 
        api: true,
        logs: true
      }
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        price: plan.price,
        features: plan.features
      },
      create: plan
    })
  }

  console.log('✅ Planos sincronizados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })