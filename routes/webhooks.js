const express = require("express");
const router = express.Router();

// POST webhook endpoint genérico
router.post("/", async (req, res) => {
  try {
    console.log("🔗 Webhook genérico recibido:", req.body);
    res.json({ message: "Webhook recibido correctamente" });
  } catch (error) {
    console.error("❌ Error procesando webhook:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

// POST webhook específico para Stripe
router.post("/stripe", async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const event = req.body;

    console.log("💳 Webhook de Stripe recibido:", event.type);

    // Procesar diferentes tipos de eventos de Stripe
    switch (event.type) {
      case "customer.subscription.created":
        console.log("✅ Nueva suscripción creada");
        break;
      case "customer.subscription.updated":
        console.log("🔄 Suscripción actualizada");
        break;
      case "customer.subscription.deleted":
        console.log("❌ Suscripción cancelada");
        break;
      case "invoice.payment_succeeded":
        console.log("💰 Pago exitoso");
        break;
      case "invoice.payment_failed":
        console.log("💸 Pago fallido");
        break;
      default:
        console.log(`🔍 Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Error en webhook Stripe:", error);
    res.status(400).json({ message: "Error procesando webhook Stripe" });
  }
});

// POST webhook para formularios externos
router.post("/form", async (req, res) => {
  try {
    const { name, email, phone, message, source } = req.body;

    console.log("📝 Lead desde formulario externo:", { name, email, source });

    // Ejemplo: guardar lead en base de datos
    // const newLead = await Lead.create({ name, email, phone, notes: message, source });

    res.json({
      message: "Lead recibido correctamente",
      data: { name, email, source },
    });
  } catch (error) {
    console.error("❌ Error procesando formulario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// GET endpoint para verificar estado de webhooks
router.get("/status", (req, res) => {
  res.json({
    message: "Webhooks funcionando correctamente",
    endpoints: [
      "POST /api/webhooks/ - Webhook genérico",
      "POST /api/webhooks/stripe - Webhooks de Stripe",
      "POST /api/webhooks/form - Formularios externos",
      "GET /api/webhooks/status - Estado de webhooks",
    ],
    timestamp: new Date(),
  });
});

module.exports = router;