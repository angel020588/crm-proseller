
// Middleware global para manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error('🚨 Error capturado:', err);

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Error de validación',
      errors: err.errors.map(e => e.message)
    });
  }

  // Error de conexión a base de datos
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      message: 'Error de conexión a la base de datos',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Servicio temporalmente no disponible'
    });
  }

  // Error de autenticación JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token inválido'
    });
  }

  // Error por defecto
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

module.exports = errorHandler;
