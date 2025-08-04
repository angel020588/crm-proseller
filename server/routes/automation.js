const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Lead = require("../models/Lead");
const Followup = require("../models/Followup");
const { Op } = require("sequelize");

// Configuración de automatización por usuario
const automationRules = new Map();

// Configurar reglas de automatización
router.post("/rules", auth, async (req, res) => {
  try {
    const { triggers, actions, conditions } = req.body;
    const userId = req.user.id;

    const rules = {
      triggers, // ['new_lead', 'status_change', 'time_based']
      actions, // ['create_followup', 'send_notification', 'change_status']
      conditions, // {'status': 'nuevo', 'days_since': 2}
      userId,
      active: true,
      createdAt: new Date(),
    };

    automationRules.set(`${userId}_automation`, rules);

    res.json({
      success: true,
      message: "Reglas de automatización configuradas",
      rules,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener reglas de automatización
router.get("/rules", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const rules = automationRules.get(`${userId}_automation`) || {};

    res.json({ rules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ejecutar automatización (llamada por cron o eventos)
router.post("/execute", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const rules = automationRules.get(`${userId}_automation`);

    if (!rules || !rules.active) {
      return res.json({ message: "No hay reglas activas" });
    }

    // Buscar leads que cumplan condiciones
    const whereConditions = {
      userId,
      ...(rules.conditions.status && { status: rules.conditions.status }),
    };

    if (rules.conditions.days_since) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - rules.conditions.days_since);
      whereConditions.updatedAt = { [Op.lte]: daysAgo };
    }

    const leads = await Lead.findAll({ where: whereConditions });

    const results = [];

    for (const lead of leads) {
      for (const action of rules.actions) {
        switch (action.type) {
          case "create_followup":
            const followup = await Followup.create({
              leadId: lead.id,
              userId,
              type: action.followupType || "llamada",
              scheduledDate: new Date(
                Date.now() + (action.delayDays || 1) * 24 * 60 * 60 * 1000,
              ),
              notes: action.notes || `Seguimiento automático para ${lead.name}`,
              status: "pendiente",
              priority: action.priority || "media",
              automated: true,
            });
            results.push({
              action: "followup_created",
              leadId: lead.id,
              followupId: followup.id,
            });
            break;

          case "change_status":
            await lead.update({ status: action.newStatus });
            results.push({
              action: "status_changed",
              leadId: lead.id,
              newStatus: action.newStatus,
            });
            break;

          case "send_notification":
            // Aquí se integraría con el sistema de notificaciones
            results.push({
              action: "notification_sent",
              leadId: lead.id,
              message: action.message,
            });
            break;
        }
      }
    }

    res.json({
      success: true,
      processed: leads.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Templates de seguimiento predefinidos
router.get("/templates", auth, async (req, res) => {
  try {
    const templates = [
      {
        id: "lead_nurturing",
        name: "Nutrición de Leads",
        description: "Seguimiento automático para leads nuevos",
        triggers: ["new_lead"],
        actions: [
          {
            type: "create_followup",
            delayDays: 1,
            followupType: "llamada",
            notes: "Primera llamada de seguimiento",
            priority: "alta",
          },
          {
            type: "create_followup",
            delayDays: 3,
            followupType: "email",
            notes: "Email de seguimiento con información adicional",
            priority: "media",
          },
        ],
      },
      {
        id: "abandoned_leads",
        name: "Leads Abandonados",
        description: "Reactivar leads sin actividad",
        triggers: ["time_based"],
        conditions: { days_since: 7 },
        actions: [
          {
            type: "create_followup",
            followupType: "whatsapp",
            notes: "Reactivación de lead sin actividad",
            priority: "alta",
          },
        ],
      },
      {
        id: "qualified_leads",
        name: "Leads Calificados",
        description: "Proceso para leads contactados",
        triggers: ["status_change"],
        conditions: { status: "contactado" },
        actions: [
          {
            type: "create_followup",
            delayDays: 2,
            followupType: "reunion",
            notes: "Agendar reunión de presentación",
            priority: "alta",
          },
        ],
      },
    ];

    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/automation
router.get("/", auth, async (req, res) => {
  try {
    // Placeholder para automatización
    res.json({
      success: true,
      automations: [],
      message: "Automatizaciones cargadas",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/automation
router.post("/", auth, async (req, res) => {
  try {
    const { name, trigger, actions } = req.body;

    // Placeholder para crear automatización
    res.json({
      success: true,
      automation: { id: Date.now(), name, trigger, actions },
      message: "Automatización creada",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
