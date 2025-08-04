const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({ 
        message: 'No hay token de autorización', 
        code: 'NO_TOKEN' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ 
        message: 'Token inválido o vacío', 
        code: 'INVALID_TOKEN' 
      });
    }

    // Verificar que el JWT_SECRET existe
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no está configurado');
      return res.status(500).json({ 
        message: 'Error de configuración del servidor',
        code: 'CONFIG_ERROR'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        message: 'Token decodificado inválido', 
        code: 'DECODE_ERROR' 
      });
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        message: 'Usuario no encontrado', 
        code: 'USER_NOT_FOUND' 
      });
    }

    // Verificar si el usuario está activo (si tienes ese campo)
    if (user.status === 'inactive') {
      return res.status(401).json({ 
        message: 'Usuario inactivo', 
        code: 'USER_INACTIVE' 
      });
    }

    req.user = user;
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

    return res.status(500).json({ 
      message: 'Error interno del servidor en autenticación',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = auth;