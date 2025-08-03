// test-routes.js
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

const rutas = [
  '/ping',
  '/auth',
  '/clients',
  '/leads',
  '/followups',
  '/admin',
  '/apikeys',
  '/quotations',
  '/supabase-clients',
  '/webhook',
  '/contactos-telefonicos',
  '/roles',
  '/dashboard',
  '/notifications',
  '/users',
  '/subscriptions',
  '/automation',
  '/analytics',
  '/custom-fields',
  '/debug'
];

(async () => {
  console.log('🔍 Verificando rutas del backend CRM...\n');

  for (const ruta of rutas) {
    try {
      const res = await axios.get(`${baseURL}${ruta}`);
      console.log(`✅ ${ruta} → ${res.status} OK`);
    } catch (error) {
      if (error.response) {
        console.log(`⚠️  ${ruta} → ${error.response.status} ${error.response.statusText}`);
      } else {
        console.log(`❌ ${ruta} → ERROR de conexión`);
      }
    }
  }

  console.log('\n🧪 Test finalizado');
})();
