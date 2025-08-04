const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes desde la raíz
const pingRoutes = require('./routes/pings');
const pingsRoutes = require('./routes/pings'); // Alias para compatibilidad
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const clientRoutes = require('./routes/clients');
const leadRoutes = require('./routes/leads');
const followupRoutes = require('./routes/followups');
const adminRoutes = require('./routes/admin');
const apiKeyRoutes = require('./routes/apikeys');
const quotationRoutes = require('./routes/quotations');
const supabaseClientsRoutes = require('./routes/supabase-clients');
const webhookRoutes = require('./routes/webhook');
const contactosTelefonicosRoutes = require('./routes/contactos-telefonicos');
const rolesRoutes = require('./routes/roles');
const dashboardRoutes = require('./routes/dashboard');
const notificationsRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const subscriptionRoutes = require('./routes/subscriptions');
const automationRoutes = require('./routes/automation');
const analyticsRoutes = require('./routes/analytics');
const customFieldsRoutes = require('./routes/custom-fields');
const debugRoutes = require('./routes/debug');

const app = express();

// Webhook route (debe ir ANTES de express.json() para recibir raw body)
app.use('/api/webhook', webhookRoutes);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { initDatabase } = require('./config/database');
const db = require('./models');
const { sequelize } = require('./config/database');

// Inicializar PostgreSQL y modelos
initDatabase()
  .then(() => {
    console.log('✅ PostgreSQL inicializado');
    return db.sequelize.sync();
  })
  .then(() => console.log('✅ Modelos sincronizados'))
  .catch(err => console.error('❌ Error inicializando base de datos:', err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/apikeys", apiKeyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/resumen", require("./routes/resumen"));
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/ping", pingRoutes);
app.use("/api/pings", pingsRoutes); // Ruta adicional para pings
app.use("/api/debug", debugRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/custom-fields", customFieldsRoutes);
app.use("/api/contactos-telefonicos", contactosTelefonicosRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/supabase-clients", supabaseClientsRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;

// Importar seeder de roles
const seedRoles = require('./seeders/seedRoles');

// Sincronizar base de datos y arrancar servidor
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Base de datos sincronizada correctamente');
    console.log('✅ Tabla ApiKey creada/actualizada');

    // Ejecutar seeder de roles
    await seedRoles();
    console.log('✅ Roles base creados/verificados');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor CRM corriendo en http://0.0.0.0:${PORT}`);
      console.log(`🚀 Backend API disponible en puerto ${PORT}`);
      console.log(`📋 Rutas registradas activas`);
      console.log(`🌐 Accesible públicamente en Replit`);
    });
  })
  .catch(err => {
    console.error('❌ Error al sincronizar base de datos:', err);
    process.exit(1);
  });