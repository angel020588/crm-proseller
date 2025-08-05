const { Role } = require('../models');

// Middleware para verificar permisos específicos
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Usuario no autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      // Si es admin, permitir todo
      if (req.user.role === 'admin' || req.user.isAdmin) {
        return next();
      }

      // Verificar rol específico
      const userRole = await Role.findOne({
        where: { name: req.user.role || 'user' }
      });

      if (!userRole) {
        return res.status(403).json({ 
          message: 'Rol no encontrado',
          code: 'ROLE_NOT_FOUND'
        });
      }

      // Verificar si el rol tiene el permiso requerido
      const permissions = userRole.permissions || [];

      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          message: `Permisos insuficientes. Se requiere: ${requiredPermission}`,
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredPermission,
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      res.status(500).json({ 
        message: 'Error interno verificando permisos',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Verificar roles específicos
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Usuario no autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      // Obtener rol del usuario, con fallback a 'usuario'
      const userRole = req.user.role || req.user.Role?.name || 'usuario';

      // Admin tiene acceso a todo
      if (userRole === 'admin') {
        return next();
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: `Acceso denegado. Rol requerido: ${allowedRoles.join(' o ')}`,
          code: 'INSUFFICIENT_ROLE',
          required: allowedRoles,
          current: userRole
        });
      }

      next();
    } catch (error) {
      console.error('❌ Error verificando rol:', error);
      res.status(500).json({ 
        message: 'Error interno verificando rol',
        code: 'ROLE_CHECK_ERROR'
      });
    }
  };
};

// Verificar si es super admin
const checkSuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Verificar si es el email super admin
    const superAdminEmails = [
      'fundaciondam2019@gmail.com',
      'admin@admin.com',
      'superadmin@crm.com'
    ];

    if (!superAdminEmails.includes(req.user.email)) {
      return res.status(403).json({ 
        message: 'Acceso restringido solo para Super Administradores',
        code: 'SUPER_ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('❌ Error verificando super admin:', error);
    res.status(500).json({ 
      message: 'Error interno verificando super admin',
      code: 'SUPER_ADMIN_CHECK_ERROR'
    });
  }
};

// Middleware para verificar que el usuario sea propietario del recurso
const checkOwnership = (resourceModel, resourceIdParam = 'id', userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // Si es admin, permitir acceso
      if (req.user.role === 'admin') {
        return next();
      }

      const resource = await resourceModel.findByPk(resourceId);

      if (!resource) {
        return res.status(404).json({ 
          message: 'Recurso no encontrado',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      if (resource[userIdField] !== userId) {
        return res.status(403).json({ 
          message: 'No tienes permisos para acceder a este recurso',
          code: 'OWNERSHIP_DENIED'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('❌ Error verificando propiedad:', error);
      res.status(500).json({ 
        message: 'Error interno verificando propiedad',
        code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

module.exports = {
  checkPermission,
  checkRole,
  checkSuperAdmin,
  checkOwnership
};