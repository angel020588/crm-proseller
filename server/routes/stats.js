
const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/verifyToken");
const { Client, Quotation, Lead, Followup } = require("../models");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener estadísticas básicas
    const [totalClients, totalQuotes, totalLeads, pendingFollowups] = await Promise.all([
      Client.count({ where: { userId } }),
      Quotation ? Quotation.count({ where: { userId } }) : 0,
      Lead.count({ where: { userId } }),
      Followup.count({ where: { assignedTo: userId, status: 'pendiente' } })
    ]);

    // Obtener última cotización
    let lastQuote = null;
    try {
      if (Quotation) {
        lastQuote = await Quotation.findOne({
          where: { userId },
          order: [["createdAt", "DESC"]],
          attributes: ["createdAt", "total", "status"]
        });
      }
    } catch (error) {
      console.log("Quotation model not available");
    }

    // Obtener actividad reciente de leads
    const recentLeads = await Lead.findAll({
      where: { userId },
      order: [["updatedAt", "DESC"]],
      limit: 5,
      attributes: ["id", "name", "status", "updatedAt"]
    });

    // Estadísticas por estado de leads
    const leadsByStatus = {};
    const leads = await Lead.findAll({
      where: { userId },
      attributes: ["status"]
    });
    
    leads.forEach(lead => {
      leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
    });

    res.json({
      totalClients,
      totalQuotes,
      totalLeads,
      pendingFollowups,
      lastQuoteDate: lastQuote ? lastQuote.createdAt : null,
      lastQuoteTotal: lastQuote ? lastQuote.total : 0,
      lastQuoteStatus: lastQuote ? lastQuote.status : null,
      leadsByStatus,
      recentActivity: recentLeads.map(lead => ({
        id: lead.id,
        name: lead.name,
        status: lead.status,
        updatedAt: lead.updatedAt,
        type: 'lead'
      }))
    });

  } catch (error) {
    console.error("Error en estadísticas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para estadísticas detalladas con filtros de fecha
router.get("/detailed", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // días hacia atrás
    
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));

    // Leads creados en el período
    const leadsInPeriod = await Lead.count({
      where: { 
        userId,
        createdAt: { [require('sequelize').Op.gte]: dateFrom }
      }
    });

    // Clientes convertidos en el período
    const clientsInPeriod = await Client.count({
      where: { 
        userId,
        createdAt: { [require('sequelize').Op.gte]: dateFrom }
      }
    });

    // Tasa de conversión
    const totalLeadsEver = await Lead.count({ where: { userId } });
    const totalClientsEver = await Client.count({ where: { userId } });
    const conversionRate = totalLeadsEver > 0 ? 
      Math.round((totalClientsEver / totalLeadsEver) * 100) : 0;

    res.json({
      period: parseInt(period),
      leadsInPeriod,
      clientsInPeriod,
      conversionRate,
      totalLeadsEver,
      totalClientsEver
    });

  } catch (error) {
    console.error("Error en estadísticas detalladas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
