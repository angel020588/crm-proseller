const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar base de datos y modelos
const db = require('./models');
const seedRoles = require('./seeders/seedRoles');

// Importar rutas
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const leadRoutes = require('./routes/leads');
const followupRoutes = require('./routes/followups');
const quotationRoutes = require('./routes/quotations');
const dashboardRoutes = require('./routes/dashboard');
const webhookRoutes = require('./routes/webhooks');
const notificationRoutes = require('./routes/notifications');
const apiKeyRoutes = require('./routes/apikeys');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const roleRoutes = require('./routes/roles');
const subscriptionRoutes = require('./routes/subscriptions');
const superAdminRoutes = require('./routes/super-admin');
const resumenRoutes = require('./routes/resumen');
const analyticsRoutes = require('./routes/analytics');
const automationRoutes = require('./routes/automation');
const customFieldsRoutes = require('./routes/custom-fields');
const privadaRoutes = require('./routes/privada');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'client/build')));

// Ruta de prueba
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ API funcionando correctamente", timestamp: new Date() });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/ping', require('./routes/pings'));
app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/apikeys', apiKeyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/resumen', resumenRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/custom-fields', customFieldsRoutes);
app.use('/api/privada', privadaRoutes);

// Middleware de manejo de errores
const errorHandler = require('./middleware/errorHandler');

// Catch-all para evitar errores 404 en rutas API
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `Ruta API no encontrada: ${req.originalUrl}` });
});

// Middleware global de errores (debe ir después de todas las rutas)
app.use(errorHandler);

// Ruta catch-all para React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Sincronizar base de datos
    await db.sequelize.sync();
    console.log('✅ Base de datos conectada');

    // Ejecutar seeders
    await seedRoles(db);

    // Iniciar servidor
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📱 Accede a tu CRM en: https://${process.env.REPL_SLUG || 'workspace'}.${process.env.REPL_OWNER || 'ecotisat'}.repl.co`);
      console.log(`🧪 Prueba la API en: https://${process.env.REPL_SLUG || 'workspace'}.${process.env.REPL_OWNER || 'ecotisat'}.repl.co/api/test`);
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();