const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const companyId = session.metadata.companyId;

      await prisma.company.update({
        where: { id: companyId },
        data: { 
          subscriptionStatus: 'ACTIVE',
          stripeSubscriptionId: session.subscription
        }
      });
      break;

    case 'invoice.payment_failed':
      // Lógica para falha de pagamento (opcional)
      break;
  }

  res.json({ received: true });
};