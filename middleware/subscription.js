
const Subscription = require('../models/Subscription');
const Lead = require('../models/Lead');

// Verificar límites de leads
const checkLeadLimit = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.status(403).json({ 
        error: 'No se encontró suscripción activa' 
      });
    }

    // Plan premium tiene leads ilimitados
    if (subscription.plan === 'premium' || subscription.maxLeads === -1) {
      return next();
    }

    // Verificar límite para plan gratuito
    const leadCount = await Lead.count({
      where: { userId: req.user.id }
    });

    if (leadCount >= subscription.maxLeads) {
      return res.status(403).json({
        error: 'Has alcanzado el límite de leads para tu plan',
        limit: subscription.maxLeads,
        current: leadCount,
        upgrade: true
      });
    }

    next();
  } catch (error) {
    console.error('Error checking lead limit:', error);
    res.status(500).json({ error: 'Error al verificar límites' });
  }
};

// Verificar límites de API calls
const checkApiLimit = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.status(403).json({ 
        error: 'No se encontró suscripción activa' 
      });
    }

    // Plan premium tiene API calls ilimitadas
    if (subscription.plan === 'premium' || subscription.maxApiCalls === -1) {
      return next();
    }

    // Aquí podrías implementar conteo de API calls
    // Por ahora permitimos continuar
    next();
  } catch (error) {
    console.error('Error checking API limit:', error);
    res.status(500).json({ error: 'Error al verificar límites de API' });
  }
};

// Verificar funcionalidades premium
const requirePremium = (feature) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({
        where: { userId: req.user.id }
      });

      if (!subscription || subscription.plan !== 'premium') {
        return res.status(403).json({
          error: `Esta funcionalidad requiere el plan Premium`,
          feature,
          upgrade: true
        });
      }

      next();
    } catch (error) {
      console.error('Error checking premium access:', error);
      res.status(500).json({ error: 'Error al verificar acceso premium' });
    }
  };
};

module.exports = {
  checkLeadLimit,
  checkApiLimit,
  requirePremium
};
