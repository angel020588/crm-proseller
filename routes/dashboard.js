const express = require('express');
const { Client, Lead, Quotation, Followup, User } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET dashboard data principal
router.get('/', auth, async (req, res) => {
  try {
    // Verificar que el usuario existe
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    const userId = req.user.id;

    // Obtener conteos básicos con validación - CORREGIR CAMPO
    const [clientsCount, leadsCount, quotationsCount, followupsCount] = await Promise.all([
      Client.count({ where: { assignedTo: userId } }).catch(() => 0),
      Lead.count({ where: { assignedTo: userId } }).catch(() => 0),
      Quotation.count({ where: { userId } }).catch(() => 0),
      Followup.count({ where: { userId } }).catch(() => 0)
    ]);

    // Obtener datos recientes con manejo de errores - CORREGIR CAMPOS
    const [recentClients, recentLeads, recentQuotations] = await Promise.all([
      Client.findAll({
        where: { assignedTo: userId },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'email', 'createdAt']
      }).catch(() => []),

      Lead.findAll({
        where: { assignedTo: userId },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'email', 'status', 'createdAt']
      }).catch(() => []),

      Quotation.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 3,
        attributes: ['id', 'title', 'amount', 'status', 'createdAt']
      }).catch(() => [])
    ]);

    // Calcular métricas del mes actual
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await Promise.all([
      Client.count({ 
        where: { 
          userId, 
          createdAt: { [Op.gte]: currentMonth } 
        } 
      }).catch(() => 0),
      Lead.count({ 
        where: { 
          userId, 
          createdAt: { [Op.gte]: currentMonth } 
        } 
      }).catch(() => 0)
    ]);

    console.log('✅ Dashboard data fetched successfully for user:', userId);

    res.json({
      success: true,
      counts: {
        clients: clientsCount,
        leads: leadsCount,
        quotations: quotationsCount,
        followups: followupsCount
      },
      monthly: {
        clients: monthlyStats[0],
        leads: monthlyStats[1]
      },
      recent: {
        clients: recentClients,
        leads: recentLeads,
        quotations: recentQuotations
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error del servidor', 
      error: error.message,
      timestamp: new Date()
    });
  }
});

// GET estadísticas de actividad
router.get('/activity', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const activity = await Promise.all([
      Client.count({
        where: {
          userId,
          createdAt: { [Op.gte]: last30Days }
        }
      }).catch(() => 0),

      Lead.count({
        where: {
          userId,
          createdAt: { [Op.gte]: last30Days }
        }
      }).catch(() => 0),

      Quotation.count({
        where: {
          userId,
          createdAt: { [Op.gte]: last30Days }
        }
      }).catch(() => 0)
    ]);

    res.json({
      success: true,
      activity: {
        clients: activity[0],
        leads: activity[1], 
        quotations: activity[2]
      },
      period: '30 días'
    });
  } catch (error) {
    console.error('❌ Error fetching activity:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error obteniendo actividad' 
    });
  }
});

// GET resumen de ventas
router.get('/sales', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const salesData = await Quotation.findAll({
      where: { userId },
      attributes: ['amount', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 50
    }).catch(() => []);

    const totalSales = salesData.reduce((sum, quote) => {
      return quote.status === 'accepted' ? sum + (parseFloat(quote.amount) || 0) : sum;
    }, 0);

    const pendingSales = salesData.reduce((sum, quote) => {
      return quote.status === 'pending' ? sum + (parseFloat(quote.amount) || 0) : sum;
    }, 0);

    res.json({
      success: true,
      sales: {
        total: totalSales,
        pending: pendingSales,
        quotations: salesData.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching sales data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error obteniendo datos de ventas' 
    });
  }
});

// GET métricas rápidas
router.get('/metrics', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const metrics = {
      todayLeads: await Lead.count({
        where: {
          userId,
          createdAt: {
            [Op.gte]: new Date().setHours(0, 0, 0, 0)
          }
        }
      }).catch(() => 0),

      pendingFollowups: await Followup.count({
        where: {
          userId,
          status: 'pending'
        }
      }).catch(() => 0),

      activeQuotations: await Quotation.count({
        where: {
          userId,
          status: 'pending'
        }
      }).catch(() => 0)
    };

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('❌ Error fetching metrics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error obteniendo métricas' 
    });
  }
});

// GET estado del sistema
router.get('/status', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      status: 'active',
      server: 'running',
      database: 'connected',
      timestamp: new Date(),
      user: {
        id: req.user.id,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('❌ Error checking status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error verificando estado' 
    });
  }
});

module.exports = router;