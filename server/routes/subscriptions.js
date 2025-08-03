
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Configuración de planes
const PLANS = {
  gratuito: {
    name: 'Plan Gratuito',
    price: 0,
    maxLeads: 100,
    maxApiCalls: 1000,
    hasAdvancedAnalytics: false,
    hasAutomation: false,
    hasCustomDomain: false,
    features: [
      'Hasta 100 leads',
      'API básica (1000 calls/mes)',
      'Dashboard básico',
      'Soporte por email'
    ]
  },
  premium: {
    name: 'Plan Premium',
    price: 29.99,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    maxLeads: -1, // Ilimitado
    maxApiCalls: -1, // Ilimitado
    hasAdvancedAnalytics: true,
    hasAutomation: true,
    hasCustomDomain: true,
    features: [
      'Leads ilimitados',
      'API ilimitada',
      'Analytics avanzados',
      'Automatización de workflows',
      'Dominio personalizado',
      'Integraciones avanzadas',
      'Soporte prioritario 24/7'
    ]
  }
};

// Obtener planes disponibles
router.get('/plans', (req, res) => {
  res.json({ plans: PLANS });
});

// Obtener suscripción actual del usuario
router.get('/current', auth, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      // Crear suscripción gratuita por defecto
      subscription = await Subscription.create({
        userId: req.user.id,
        plan: 'gratuito',
        status: 'active',
        ...PLANS.gratuito
      });
    }

    const planDetails = PLANS[subscription.plan];
    
    res.json({
      subscription: {
        ...subscription.toJSON(),
        planDetails
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Error al obtener suscripción' });
  }
});

// Crear sesión de checkout para premium
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    // Crear o obtener customer de Stripe
    let customer;
    let subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    });

    if (subscription && subscription.stripeCustomerId) {
      customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id.toString()
        }
      });

      if (subscription) {
        await subscription.update({ stripeCustomerId: customer.id });
      }
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PLANS.premium.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id.toString()
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Error al crear sesión de pago' });
  }
});

// Verificar pago exitoso
router.get('/verify-payment', auth, async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID requerido' });
    }

    // Obtener información de la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      // Obtener suscripción actualizada
      const subscription = await Subscription.findOne({
        where: { userId: req.user.id }
      });

      res.json({
        success: true,
        subscription: subscription,
        session: {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total
        }
      });
    } else {
      res.status(400).json({ error: 'Pago no completado' });
    }
  } catch (error) {
    console.error('Error verificando pago:', error);
    res.status(500).json({ error: 'Error al verificar pago' });
  }
});

// Portal de gestión de suscripción
router.post('/create-portal-session', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    });

    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(400).json({ error: 'No se encontró customer de Stripe' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Error al crear portal de facturación' });
  }
});

// Webhook de Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

// Funciones auxiliares para manejar webhooks
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
  
  await Subscription.upsert({
    userId: parseInt(userId),
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
    plan: 'premium',
    status: stripeSubscription.status,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    ...PLANS.premium
  });
}

async function handlePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    await Subscription.update({
      status: 'active',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    }, {
      where: { stripeSubscriptionId: invoice.subscription }
    });
  }
}

async function handlePaymentFailed(invoice) {
  if (invoice.subscription) {
    await Subscription.update({
      status: 'past_due'
    }, {
      where: { stripeSubscriptionId: invoice.subscription }
    });
  }
}

async function handleSubscriptionUpdated(stripeSubscription) {
  await Subscription.update({
    status: stripeSubscription.status,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
  }, {
    where: { stripeSubscriptionId: stripeSubscription.id }
  });
}

async function handleSubscriptionDeleted(stripeSubscription) {
  await Subscription.update({
    plan: 'gratuito',
    status: 'active',
    stripeSubscriptionId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    ...PLANS.gratuito
  }, {
    where: { stripeSubscriptionId: stripeSubscription.id }
  });
}

module.exports = router;
