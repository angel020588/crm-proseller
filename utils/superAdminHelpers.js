
const { User, Subscription, Client, Quotation } = require('../models');
const { Op } = require('sequelize');

class SuperAdminHelpers {
  // 🎯 Obtener estadísticas completas del sistema
  static async getSystemStats() {
    try {
      const [
        totalUsers,
        premiumUsers,
        totalClients,
        totalQuotations,
        monthlyRevenue,
        activeSubscriptions
      ] = await Promise.all([
        User.count(),
        User.count({ where: { isPremium: true } }),
        Client.count(),
        Quotation.count(),
        this.calculateMonthlyRevenue(),
        Subscription.count({ where: { status: 'active' } })
      ]);

      return {
        totalUsers,
        premiumUsers,
        totalClients,
        totalQuotations,
        monthlyRevenue,
        activeSubscriptions,
        conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {};
    }
  }

  // 💰 Calcular ingresos mensuales
  static async calculateMonthlyRevenue() {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1); // Primer día del mes

      const subscriptions = await Subscription.findAll({
        where: {
          status: 'active',
          createdAt: {
            [Op.gte]: currentMonth
          }
        }
      });

      return subscriptions.reduce((total, sub) => {
        const price = sub.plan === 'premium' ? 29.99 : 0;
        return total + price;
      }, 0);
    } catch (error) {
      console.error('Error calculating revenue:', error);
      return 0;
    }
  }

  // 👑 Regalar premium a usuario
  static async giftPremium(userId, months = 3) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('Usuario no encontrado');

      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + months);

      await user.update({
        isPremium: true,
        premiumExpiresAt: expirationDate
      });

      // Crear o actualizar suscripción
      await Subscription.upsert({
        userId: userId,
        plan: 'premium',
        status: 'active',
        expiresAt: expirationDate
      });

      return { success: true, message: `Premium regalado por ${months} meses` };
    } catch (error) {
      console.error('Error gifting premium:', error);
      return { success: false, message: error.message };
    }
  }

  // 📊 Exportar todos los datos
  static async exportAllData() {
    try {
      const [users, clients, quotations, subscriptions] = await Promise.all([
        User.findAll({ attributes: { exclude: ['password'] } }),
        Client.findAll(),
        Quotation.findAll(),
        Subscription.findAll()
      ]);

      return {
        exportDate: new Date().toISOString(),
        totalRecords: users.length + clients.length + quotations.length + subscriptions.length,
        data: {
          users,
          clients,
          quotations,
          subscriptions
        }
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}

module.exports = SuperAdminHelpers;
