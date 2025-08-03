const express = require("express");
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const verifyToken = require("../middlewares/verifyToken");
const { User, Lead, Client, Quotation, Followup } = require("../models");

// GET /api/analytics - Dashboard principal con métricas
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // días hacia atrás

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));

    // Métricas generales
    const totalLeads = await Lead.count({ where: { userId } });
    const totalClients = await Client.count({ where: { userId } });
    const totalQuotations = await Quotation.count({ where: { userId } });
    const pendingFollowups = await Followup.count({ 
      where: { userId, completed: false } 
    });

    // Leads por estado
    const leadsByStatus = await Lead.findAll({
      attributes: [
        'status',
        [fn('COUNT', '*'), 'count']
      ],
      where: { userId },
      group: ['status'],
      raw: true
    });

    // Leads por mes (últimos 6 meses)
    const leadsPerMonth = await Lead.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
        [fn('COUNT', '*'), 'count']
      ],
      where: { 
        userId,
        createdAt: { [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
      },
      group: [fn('DATE_TRUNC', 'month', col('createdAt'))],
      order: [[fn('DATE_TRUNC', 'month', col('createdAt')), 'ASC']],
      raw: true
    });

    // Cotizaciones por estado
    const quotationsByStatus = await Quotation.findAll({
      attributes: [
        'status',
        [fn('COUNT', '*'), 'count'],
        [fn('SUM', col('total')), 'totalAmount']
      ],
      where: { userId },
      group: ['status'],
      raw: true
    });

    // Valor total de cotizaciones
    const totalQuotationValue = await Quotation.sum('total', { where: { userId } }) || 0;

    // Próximos seguimientos (próximos 7 días)
    const upcomingFollowups = await Followup.findAll({
      where: {
        userId,
        completed: false,
        scheduledAt: {
          [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        }
      },
      include: [
        { model: Lead, attributes: ['name', 'email'] },
        { model: Client, attributes: ['name', 'email'] }
      ],
      order: [['scheduledAt', 'ASC']],
      limit: 10
    });

    res.json({
      summary: {
        totalLeads,
        totalClients,
        totalQuotations,
        pendingFollowups,
        totalQuotationValue
      },
      charts: {
        leadsByStatus,
        leadsPerMonth,
        quotationsByStatus
      },
      upcomingFollowups
    });

  } catch (error) {
    console.error("❌ Error en analytics:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// GET /api/analytics/leads - Análisis detallado de leads
router.get("/leads", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Conversión de leads a clientes
    const conversionRate = await Lead.findAll({
      attributes: [
        [fn('COUNT', '*'), 'totalLeads'],
        [fn('SUM', literal("CASE WHEN status = 'convertido' THEN 1 ELSE 0 END")), 'convertedLeads']
      ],
      where: { userId },
      raw: true
    });

    // Fuentes de leads
    const leadSources = await Lead.findAll({
      attributes: [
        'source',
        [fn('COUNT', '*'), 'count']
      ],
      where: { userId },
      group: ['source'],
      raw: true
    });

    // Rendimiento por vendedor (si hay múltiples usuarios)
    const salesPerformance = await Lead.findAll({
      attributes: [
        [fn('COUNT', '*'), 'totalLeads'],
        [fn('SUM', literal("CASE WHEN status = 'convertido' THEN 1 ELSE 0 END")), 'convertedLeads']
      ],
      where: { userId },
      include: [{ model: User, attributes: ['name'] }],
      group: ['User.id', 'User.name'],
      raw: true
    });

    res.json({
      conversionRate: conversionRate[0] || { totalLeads: 0, convertedLeads: 0 },
      leadSources,
      salesPerformance
    });

  } catch (error) {
    console.error("❌ Error en analytics de leads:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// GET /api/analytics/revenue - Análisis de ingresos
router.get("/revenue", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Ingresos por mes
    const revenuePerMonth = await Quotation.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
        [fn('SUM', col('total')), 'revenue'],
        [fn('COUNT', '*'), 'quotations']
      ],
      where: { 
        userId,
        status: 'aceptada'
      },
      group: [fn('DATE_TRUNC', 'month', col('createdAt'))],
      order: [[fn('DATE_TRUNC', 'month', col('createdAt')), 'ASC']],
      raw: true
    });

    // Pipeline de ventas
    const salesPipeline = await Quotation.findAll({
      attributes: [
        'status',
        [fn('SUM', col('total')), 'totalValue'],
        [fn('COUNT', '*'), 'count']
      ],
      where: { userId },
      group: ['status'],
      raw: true
    });

    res.json({
      revenuePerMonth,
      salesPipeline
    });

  } catch (error) {
    console.error("❌ Error en analytics de revenue:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;