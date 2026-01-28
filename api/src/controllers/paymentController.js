const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const stripePlans = require('../config/stripePlans');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

exports.createCheckoutSession = async (req, res) => {
  const companyId = req.user.companyId;
  const userEmail = req.user.email;
  
  // Recebe o ciclo desejado (monthly, yearly, semesterly)
  // Se não vier nada, assume 'monthly'
  const cycle = req.body.cycle || 'monthly';

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true }
    });

    // Busca as opções do plano da empresa (ex: basico)
    const planOptions = stripePlans[company.plan.slug];

    if (!planOptions) {
      return res.status(400).json({ error: "Plano não configurado na Stripe." });
    }

    // Seleciona o ID do preço baseado no ciclo escolhido
    const priceId = planOptions[cycle];

    if (!priceId) {
      return res.status(400).json({ error: `Ciclo ${cycle} não disponível para este plano.` });
    }

    let customerId = company.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { companyId: company.id }
      });
      customerId = customer.id;
      
      await prisma.company.update({
        where: { id: companyId },
        data: { stripeCustomerId: customerId }
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
      metadata: { companyId: companyId }
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar pagamento." });
  }
};