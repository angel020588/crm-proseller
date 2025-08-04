
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

// Middleware para verificar roles específicos
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Usuario no autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      const userRole = req.user.role || 'user';
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!rolesArray.includes(userRole)) {
        return res.status(403).json({ 
          message: `Acceso denegado. Roles permitidos: ${rolesArray.join(', ')}`,
          code: 'ROLE_ACCESS_DENIED',
          userRole: userRole,
          allowedRoles: rolesArray
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
  checkOwnership
};
