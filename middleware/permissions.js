
const Role = require('../models/Role');

const checkPermission = (module, action = 'read') => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Owner siempre tiene todos los permisos
      if (user.role === 'owner') {
        return next();
      }

      // Buscar el rol del usuario
      const role = await Role.findOne({ where: { name: user.role } });
      
      if (!role) {
        return res.status(403).json({ error: 'Rol no válido' });
      }

      // Verificar permisos del módulo
      const modulePermissions = role.permissions[module];
      
      if (!modulePermissions || !modulePermissions[action]) {
        return res.status(403).json({ 
          error: `No tienes permisos para ${action} en ${module}`,
          required: `${module}.${action}`,
          userRole: user.role
        });
      }

      // Agregar permisos al request para uso posterior
      req.permissions = role.permissions;
      req.userRole = role;
      
      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
};

const hasAnyPermission = (modules) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      if (user.role === 'owner') {
        return next();
      }

      const role = await Role.findOne({ where: { name: user.role } });
      
      if (!role) {
        return res.status(403).json({ error: 'Rol no válido' });
      }

      // Verificar si tiene al menos un permiso de los módulos solicitados
      const hasPermission = modules.some(module => {
        const modulePermissions = role.permissions[module];
        return modulePermissions && (
          modulePermissions.read || 
          modulePermissions.write || 
          modulePermissions.delete
        );
      });

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'No tienes permisos para acceder a este recurso',
          userRole: user.role
        });
      }

      req.permissions = role.permissions;
      req.userRole = role;
      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
};

module.exports = {
  checkPermission,
  hasAnyPermission
};
