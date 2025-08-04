const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/verifyToken");
const { Lead, Client, Followup } = require("../models");
const { Op } = require("sequelize");
// ... tus rutas aquí ...

// Obtener datos del dashboard
router.get("/", verifyToken, async (req, res) => {
  try {
    const leadCount = await Lead.count({ where: { userId: req.user.id } });
    const clientCount = await Client.count({ where: { userId: req.user.id } });
    const followupCount = await Followup.count({
      where: { assignedTo: req.user.id, status: "pendiente" },
    });

    const recentLeads = await Lead.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.json({
      stats: {
        leads: leadCount,
        clients: clientCount,
        followups: followupCount,
      },
      recentLeads,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

// GET /api/dashboard/stats - Estadísticas completas para el dashboard
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Contar registros por usuario
    const [leadCount, clientCount, quotationCount, followupCount] =
      await Promise.all([
        Lead.count({ where: { userId } }),
        Client.count({ where: { userId } }),
        Quotation ? Quotation.count({ where: { userId } }) : 0,
        Followup.count({ where: { assignedTo: userId, status: "pendiente" } }),
      ]);

    // Contar API Keys activas
    let activeApiKeysCount = 0;
    try {
      const { ApiKey } = require("../models");
      if (ApiKey) {
        activeApiKeysCount = await ApiKey.count({
          where: { userId, isActive: true },
        });
      }
    } catch (error) {
      console.log("ApiKey model not available");
    }

    // Obtener actividad reciente (últimos leads y clientes)
    const recentLeads = await Lead.findAll({
      where: { userId },
      order: [["updatedAt", "DESC"]],
      limit: 3,
      attributes: ["id", "name", "status", "updatedAt"],
    });

    const recentClients = await Client.findAll({
      where: { userId },
      order: [["updatedAt", "DESC"]],
      limit: 2,
      attributes: ["id", "name", "updatedAt"],
    });

    // Formatear actividad reciente
    const recentActivity = [
      ...recentLeads.map((lead) => ({
        id: lead.id,
        type: "lead",
        client: lead.name,
        action: `Lead ${lead.name} actualizado`,
        icon: getStatusIcon(lead.status),
        date: lead.updatedAt,
      })),
      ...recentClients.map((client) => ({
        id: client.id,
        type: "client",
        client: client.name,
        action: `Cliente ${client.name} actualizado`,
        icon: "👤",
        date: client.updatedAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      totalLeads: leadCount,
      totalClients: clientCount,
      totalQuotations: quotationCount,
      activeApiKeys: activeApiKeysCount,
      pendingFollowups: followupCount,
      recentActivity,
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

// Función auxiliar para iconos de estado
function getStatusIcon(status) {
  const icons = {
    nuevo: "🆕",
    contactado: "📞",
    cotizado: "📄",
    cerrado: "✅",
    perdido: "❌",
    seguimiento: "🔄",
  };
  return icons[status] || "📝";
}

module.exports = router;
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener todos los datos necesarios
    const [clients, leads, apiKeys, followups] = await Promise.all([
      Client.find({ assignedTo: userId }),
      Lead.find({ assignedTo: userId }),
      ApiKey.find({ userId: userId }),
      Followup.find({ assignedTo: userId }),
    ]);

    // Calcular métricas
    const stats = {
      totalClients: clients.length,
      totalLeads: leads.length,
      activeDeals: leads.filter((lead) =>
        ["contactado", "cotizado"].includes(lead.status),
      ).length,
      closedDeals: leads.filter((lead) => lead.status === "cerrado").length,
      apiKeysActive: apiKeys.filter((key) => key.isActive).length,
      followupsPending: followups.filter((f) => f.status === "pendiente")
        .length,
    };

    // Calcular tasa de conversión
    stats.conversionRate =
      stats.totalLeads > 0
        ? Math.round((stats.closedDeals / stats.totalLeads) * 100)
        : 0;

    // Leads de esta semana
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    stats.recentLeads = leads.filter(
      (lead) => new Date(lead.createdAt) >= weekAgo,
    ).length;

    // Datos para gráficos
    const chartData = {
      leadsThisWeek: generateWeeklyData(leads),
      topSources: generateTopSources(leads),
      conversionTrend: generateConversionTrend(leads),
    };

    // Actividad reciente
    const recentActivity = leads
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map((lead) => ({
        id: lead._id,
        type: getActivityType(lead.status),
        client: lead.name,
        action: getActivityAction(lead.status, lead.updatedAt),
        icon: getActivityIcon(lead.status),
        date: lead.updatedAt,
      }));

    res.json({
      stats,
      chartData,
      recentActivity,
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Funciones auxiliares
function generateWeeklyData(leads) {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const weekData = days.map((day) => ({ day, leads: 0 }));

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday

  leads.forEach((lead) => {
    const leadDate = new Date(lead.createdAt);
    if (leadDate >= weekStart) {
      const dayIndex = (leadDate.getDay() + 6) % 7; // Adjust for Monday start
      if (weekData[dayIndex]) {
        weekData[dayIndex].leads++;
      }
    }
  });

  return weekData;
}

function generateTopSources(leads) {
  const sources = {};
  leads.forEach((lead) => {
    const source = lead.source || "directo";
    sources[source] = (sources[source] || 0) + 1;
  });

  return Object.entries(sources)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function generateConversionTrend(leads) {
  const months = {};
  leads.forEach((lead) => {
    const month = new Date(lead.createdAt).toLocaleString("es", {
      month: "short",
    });
    if (!months[month]) {
      months[month] = { total: 0, converted: 0 };
    }
    months[month].total++;
    if (lead.status === "cerrado") {
      months[month].converted++;
    }
  });

  return Object.entries(months).map(([month, data]) => ({
    month,
    conversion:
      data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0,
  }));
}

function getActivityType(status) {
  const types = {
    nuevo: "lead",
    contactado: "call",
    cotizado: "quote",
    cerrado: "deal",
    perdido: "lost",
  };
  return types[status] || "other";
}

function getActivityAction(status, updatedAt) {
  const date = new Date(updatedAt);
  const now = new Date();
  const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
  const timeAgo =
    diffHours < 24 ? `${diffHours}h` : `${Math.floor(diffHours / 24)}d`;

  const actions = {
    nuevo: `Nuevo lead registrado hace ${timeAgo}`,
    contactado: `Lead contactado hace ${timeAgo}`,
    cotizado: `Cotización enviada hace ${timeAgo}`,
    cerrado: `Negocio cerrado hace ${timeAgo}`,
    perdido: `Lead perdido hace ${timeAgo}`,
  };
  return actions[status] || `Actualizado hace ${timeAgo}`;
}

function getActivityIcon(status) {
  const icons = {
    nuevo: "🆕",
    contactado: "📞",
    cotizado: "📩",
    cerrado: "✅",
    perdido: "❌",
  };
  return icons[status] || "📝";
}
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const [clients, quotations, apiKeys] = await Promise.all([
      Client.count({ where: { userId: req.user.id } }),
      Quotation.count({ where: { userId: req.user.id } }),
      ApiKey.count({ where: { userId: req.user.id, isActive: true } }),
    ]);

    res.json({
      totalClients: clients,
      totalQuotations: quotations,
      activeApiKeys: apiKeys,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token requerido" });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu_jwt_secret_aqui",
    );

    const [clients, leads, quotations, followups] = await Promise.all([
      Client.count({ where: { userId: decoded.id } }),
      Lead.count({ where: { userId: decoded.id } }),
      Quotation.count({ where: { userId: decoded.id } }),
      Followup.count({ where: { userId: decoded.id } }),
    ]);

    res.json({ clients, leads, quotations, followups });
  } catch (err) {
    console.error("Error en dashboard:", err);
    res.status(500).json({ error: "Error al cargar estadísticas" });
  }
});
// Exportar router al final
module.exports = router;
