const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { User, Subscription } = require("../models");

// Webhook de Stripe
router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});

// Funciones auxiliares
async function handleCheckoutCompleted(session) {
  console.log("Processing checkout.session.completed:", session.id);

  if (!session.metadata || !session.metadata.userId) {
    console.warn("No userId found in session metadata");
    return;
  }

  const userId = parseInt(session.metadata.userId);
  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

  // Actualizar o crear suscripción
  await Subscription.upsert({
    userId: userId,
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
    plan: 'premium',
    status: stripeSubscription.status,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    maxLeads: -1, // Ilimitado
    maxApiCalls: -1, // Ilimitado
    hasAdvancedAnalytics: true,
    hasAutomation: true,
    hasCustomDomain: true
  });

  console.log(`✅ Suscripción premium activada para usuario ${userId}`);
}

async function handlePaymentSucceeded(invoice) {
  console.log("Processing invoice.payment_succeeded:", invoice.id);

  if (invoice.subscription) {
    const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);

    await Subscription.update({
      status: 'active',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    }, {
      where: { stripeSubscriptionId: invoice.subscription }
    });

    console.log(`✅ Pago exitoso para suscripción ${invoice.subscription}`);
  }
}

async function handlePaymentFailed(invoice) {
  console.log("Processing invoice.payment_failed:", invoice.id);

  if (invoice.subscription) {
    await Subscription.update({
      status: 'past_due'
    }, {
      where: { stripeSubscriptionId: invoice.subscription }
    });

    console.log(`⚠️ Pago fallido para suscripción ${invoice.subscription}`);
  }
}

async function handleSubscriptionUpdated(stripeSubscription) {
  console.log("Processing customer.subscription.updated:", stripeSubscription.id);

  await Subscription.update({
    status: stripeSubscription.status,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
  }, {
    where: { stripeSubscriptionId: stripeSubscription.id }
  });

  console.log(`✅ Suscripción actualizada: ${stripeSubscription.id}`);
}

async function handleSubscriptionDeleted(stripeSubscription) {
  console.log("Processing customer.subscription.deleted:", stripeSubscription.id);

  // Regresar al plan gratuito
  await Subscription.update({
    plan: 'gratuito',
    status: 'active',
    stripeSubscriptionId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    maxLeads: 100,
    maxApiCalls: 1000,
    hasAdvancedAnalytics: false,
    hasAutomation: false,
    hasCustomDomain: false
  }, {
    where: { stripeSubscriptionId: stripeSubscription.id }
  });

  console.log(`✅ Usuario regresado al plan gratuito`);
}

module.exports = router;