const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Token de autorización requerido', 
        code: 'NO_TOKEN' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ 
        message: 'Token inválido', 
        code: 'INVALID_TOKEN' 
      });
    }

    // Usar JWT_SECRET con fallback
    const jwtSecret = process.env.JWT_SECRET || "clave-demo";
    
    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        message: 'Token decodificado inválido', 
        code: 'DECODE_ERROR' 
      });
    }

    // Incluir rol en la consulta del usuario
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: require('../models').Role,
        as: 'Role',
        attributes: ['id', 'name', 'displayName', 'permissions']
      }]
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Usuario no encontrado', 
        code: 'USER_NOT_FOUND' 
      });
    }

    // Verificar si el usuario está activo
    if (user.isActive === false) {
      return res.status(401).json({ 
        message: 'Usuario inactivo', 
        code: 'USER_INACTIVE' 
      });
    }

    // Agregar información de rol al req.user
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: user.Role?.name || 'usuario',
      permissions: user.Role?.permissions || {},
      isActive: user.isActive
    };

    next();
  } catch (error) {
    console.error('❌ Error en middleware de autenticación:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token JWT malformado', 
        code: 'JWT_MALFORMED' 
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado', 
        code: 'TOKEN_EXPIRED' 
      });
    }

    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ 
        message: 'Error de base de datos', 
        code: 'DATABASE_ERROR' 
      });
    }

    return res.status(500).json({ 
      message: 'Error interno del servidor en autenticación',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = auth;