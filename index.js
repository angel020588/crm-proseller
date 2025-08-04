
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./server/routes/auth');
const clientRoutes = require('./server/routes/clients');
const leadRoutes = require('./server/routes/leads');
const quotationRoutes = require('./server/routes/quotations');
const followupRoutes = require('./server/routes/followups');
const dashboardRoutes = require('./server/routes/dashboard');
const analyticsRoutes = require('./server/routes/analytics');
const subscriptionRoutes = require('./server/routes/subscriptions');
const webhookRoutes = require('./server/routes/webhook');
const accountRoutes = require('./server/routes/account');
const rolesRoutes = require('./server/routes/roles');
const usersRoutes = require('./server/routes/users');
const notificationsRoutes = require('./server/routes/notifications');
const automationRoutes = require('./server/routes/automation');
const apikeysRoutes = require('./server/routes/apikeys');
const customFieldsRoutes = require('./server/routes/custom-fields');
const adminRoutes = require('./server/routes/admin');
const resumenRoutes = require('./server/routes/resumen');
const statsRoutes = require('./server/routes/stats');
const contactosTelefonicosRoutes = require('./server/routes/contactos-telefonicos');
const supabaseClientsRoutes = require('./server/routes/supabase-clients');
const pingRoutes = require('./server/routes/ping');
const debugRoutes = require('./server/routes/debug');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/apikeys', apikeysRoutes);
app.use('/api/custom-fields', customFieldsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resumen', resumenRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/contactos-telefonicos', contactosTelefonicosRoutes);
app.use('/api/supabase-clients', supabaseClientsRoutes);
app.use('/api/ping', pingRoutes);
app.use('/api/debug', debugRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Basic route for development
app.get('/', (req, res) => {
  res.json({ 
    message: 'CRM ProSeller API funcionando',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/clients', 
      '/api/leads',
      '/api/quotations',
      '/api/followups',
      '/api/dashboard'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor CRM ejecutándose en puerto ${PORT}`);
});
