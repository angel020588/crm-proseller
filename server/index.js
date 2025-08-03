const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '/etc/secrets/.env' });

// Import routes
const pingRoute = require('./routes/ping');
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
const rolesRoutes = require('./routes/roles'); // Added roles route
const dashboardRoutes = require('./routes/dashboard');
const notificationsRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users'); // Assuming users route exists
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

// Routes
// Rutas API
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/clients", require("./routes/clients"));
app.use("/api/quotations", require("./routes/quotations"));
app.use("/api/leads", require("./routes/leads"));
app.use("/api/followups", require("./routes/followups"));
app.use("/api/apikeys", require("./routes/apikeys"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/resumen", require("./routes/resumen"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/automation", require("./routes/automation"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/ping", require("./routes/ping"));
app.use("/api/debug", require("./routes/debug"));
app.use("/api/subscriptions", require("./routes/subscriptions"));
app.use("/api/custom-fields", require("./routes/custom-fields"));
app.use("/api/contactos-telefonicos", require("./routes/contactos-telefonicos"));
app.use("/api/account", accountRoutes);
app.use("/api/supabase-clients", supabaseClientsRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

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
      console.log(`📋 Rutas registradas: ${Object.keys(app._router.stack).length} rutas activas`);
    });
  })
  .catch(err => {
    console.error('❌ Error al sincronizar base de datos:', err);
    process.exit(1);
  });