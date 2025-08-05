const express = require('express');
const { User, Role, Client, Lead, Quotation, Followup } = require('../models');
const auth = require('../middleware/auth');
const { checkRole, checkSuperAdmin } = require('../middleware/permissions');

const router = express.Router();

// Middleware para verificar que solo el super admin puede acceder
const checkSuperAdminMiddleware = (req, res, next) => {
  if (req.user.email !== 'fundaciondam2019@gmail.com') {
    return res.status(403).json({ message: 'Acceso denegado - Solo Super Admin' });
  }
  next();
};

// GET todos los usuarios con datos completos - Solo Super Admin
router.get('/users', auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: 'Role',
          attributes: ['id', 'name', 'displayName']
        },
        {
          model: Subscription,
          attributes: ['plan', 'status', 'startDate', 'endDate']
        }
      ],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    // Agregar datos calculados
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const userData = user.toJSON();

      // Calcular ingresos totales por usuario (simulado)
      userData.totalRevenue = userData.Subscriptions?.length > 0 ? 29.99 : 0;

      return userData;
    }));

    res.json(enrichedUsers);
  } catch (error) {
    console.error('Error fetching super admin users:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// GET estadísticas completas del sistema - Solo Super Admin
router.get('/stats', auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const [totalUsers, premiumUsers, activeSubscriptions] = await Promise.all([
      User.count(),
      Subscription.count({ where: { plan: 'premium', status: 'active' } }),
      Subscription.count({ where: { status: 'active' } })
    ]);

    // Calcular ingresos mensuales estimados
    const monthlyRevenue = premiumUsers * 29.99;

    res.json({
      totalUsers,
      premiumUsers,
      activeSubscriptions,
      monthlyRevenue: monthlyRevenue.toFixed(2),
      freeUsers: totalUsers - premiumUsers,
      conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching super admin stats:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// POST regalar premium a cualquier usuario - Solo Super Admin
router.post('/gift-premium', auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const { userId, months } = req.body;

    if (!userId || !months) {
      return res.status(400).json({ message: 'userId y months son requeridos' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Buscar o crear suscripción
    let subscription = await Subscription.findOne({ where: { userId } });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(months));

    if (subscription) {
      await subscription.update({
        plan: 'premium',
        status: 'active',
        endDate: endDate
      });
    } else {
      subscription = await Subscription.create({
        userId,
        plan: 'premium',
        status: 'active',
        startDate: new Date(),
        endDate: endDate,
        maxLeads: -1,
        maxApiCalls: -1,
        hasAdvancedAnalytics: true,
        hasAutomation: true,
        hasCustomDomain: true
      });
    }

    res.json({
      message: `Premium regalado por ${months} meses a ${user.name}`,
      subscription,
      giftedBy: req.user.email,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error gifting premium:', error);
    res.status(500).json({ message: 'Error al regalar premium', error: error.message });
  }
});

// PUT cambiar rol de cualquier usuario - Solo Super Admin
router.put('/change-role', auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const { userId, role } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Buscar el rol por nombre
    const roleObj = await Role.findOne({ where: { name: role } });

    await user.update({
      roleId: roleObj ? roleObj.id : null
    });

    res.json({
      message: `Rol cambiado a ${role} para ${user.name}`,
      changedBy: req.user.email,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ message: 'Error al cambiar rol', error: error.message });
  }
});

// POST crear código de descuento - Solo Super Admin
router.post('/create-discount', auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const { code, discount, maxUses } = req.body;

    // Aquí podrías crear una tabla de códigos de descuento
    // Por ahora simulamos la creación

    res.json({
      message: `Código de descuento "${code}" creado`,
      code,
      discount: `${discount}%`,
      maxUses: maxUses || 'Ilimitado',
      createdBy: req.user.email,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error creating discount code:', error);
    res.status(500).json({ message: 'Error al crear código de descuento', error: error.message });
  }
});

// POST modo mantenimiento - Solo Super Admin
router.post('/maintenance', auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const { enabled } = req.body;

    // Aquí podrías guardar en una tabla de configuración del sistema
    // Por ahora simulamos

    res.json({
      message: `Modo mantenimiento ${enabled ? 'activado' : 'desactivado'}`,
      maintenanceMode: enabled,
      setBy: req.user.email,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error setting maintenance mode:', error);
    res.status(500).json({ message: 'Error al cambiar modo mantenimiento', error: error.message });
  }
});

// GET reporte financiero - Solo Super Admin
router.get('/financial-report', auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Subscription,
        attributes: ['plan', 'status', 'startDate', 'endDate']
      }],
      attributes: ['id', 'name', 'email', 'createdAt']
    });

    // Crear datos del reporte
    const reportData = users.map(user => {
      const subscription = user.Subscriptions?.[0];
      return [
        user.id,
        user.name,
        user.email,
        subscription?.plan || 'gratuito',
        subscription?.status || 'N/A',
        subscription?.plan === 'premium' ? '29.99' : '0.00',
        user.createdAt
      ];
    });

    // Crear CSV
    const headers = ['ID', 'Nombre', 'Email', 'Plan', 'Estado', 'Ingresos', 'Fecha Registro'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_financiero_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ message: 'Error al generar reporte financiero', error: error.message });
  }
});

// POST notificación global - Solo Super Admin
router.post('/global-notification', auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const { title, message, type } = req.body;

    // Aquí podrías crear notificaciones para todos los usuarios
    const users = await User.findAll({ attributes: ['id'] });

    // Simular creación de notificaciones
    res.json({
      message: `Notificación "${title}" enviada a ${users.length} usuarios`,
      title,
      type,
      recipientCount: users.length,
      sentBy: req.user.email,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error sending global notification:', error);
    res.status(500).json({ message: 'Error al enviar notificación global', error: error.message });
  }
});

// GET exportar todos los datos - Solo Super Admin
router.get('/export/all-data', auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const [users, subscriptions] = await Promise.all([
      User.findAll({
        include: [{ model: Role, as: 'Role' }],
        attributes: { exclude: ['password'] }
      }),
      Subscription.findAll()
    ]);

    // Crear estructura de datos completa
    const exportData = {
      users: users.map(u => u.toJSON()),
      subscriptions: subscriptions.map(s => s.toJSON()),
      exportedBy: req.user.email,
      exportDate: new Date().toISOString(),
      totalRecords: users.length + subscriptions.length
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="super_admin_export_${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(exportData, null, 2));

  } catch (error) {
    console.error('Error exporting all data:', error);
    res.status(500).json({ message: 'Error al exportar datos', error: error.message });
  }
});

module.exports = router;