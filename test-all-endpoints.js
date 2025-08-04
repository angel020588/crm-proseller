
const axios = require('axios');

class EndpointTester {
  constructor(baseUrl = 'http://0.0.0.0:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async testEndpoint(method, path, expectedStatus = [200, 401, 403]) {
    try {
      const config = {
        method: method.toLowerCase(),
        url: `${this.baseUrl}${path}`,
        timeout: 5000,
        validateStatus: () => true // No lanzar error por códigos de estado
      };

      const response = await axios(config);
      const isExpected = expectedStatus.includes(response.status);
      
      this.results.push({
        method,
        path,
        status: response.status,
        expected: isExpected,
        responseTime: response.headers['x-response-time'] || 'N/A'
      });

      const statusIcon = isExpected ? '✅' : '⚠️';
      console.log(`${statusIcon} ${method} ${path} - ${response.status} (${response.statusText})`);
      
      return response;
    } catch (error) {
      this.results.push({
        method,
        path,
        status: 'ERROR',
        expected: false,
        error: error.message
      });
      
      console.log(`❌ ${method} ${path} - ERROR: ${error.message}`);
      return null;
    }
  }

  async testAllEndpoints() {
    console.log('🧪 Probando todos los endpoints del CRM...\n');

    // Endpoints públicos
    console.log('📱 ENDPOINTS PÚBLICOS:');
    await this.testEndpoint('GET', '/api/ping', [200]);
    await this.testEndpoint('POST', '/api/auth/login', [400, 401]); // Sin datos
    await this.testEndpoint('POST', '/api/auth/register', [400]); // Sin datos
    await this.testEndpoint('POST', '/api/supabase-clients', [400]); // Sin datos
    await this.testEndpoint('POST', '/api/webhook', [400]); // Sin datos

    console.log('\n🔒 ENDPOINTS PROTEGIDOS (sin autenticación):');
    // Endpoints que requieren autenticación
    await this.testEndpoint('GET', '/api/clients', [401]);
    await this.testEndpoint('POST', '/api/clients', [401]);
    await this.testEndpoint('GET', '/api/quotations', [401]);
    await this.testEndpoint('POST', '/api/quotations', [401]);
    await this.testEndpoint('GET', '/api/leads', [401]);
    await this.testEndpoint('POST', '/api/leads', [401]);
    await this.testEndpoint('GET', '/api/followups', [401]);
    await this.testEndpoint('POST', '/api/followups', [401]);
    await this.testEndpoint('GET', '/api/dashboard', [401]);
    await this.testEndpoint('GET', '/api/users', [401]);
    await this.testEndpoint('GET', '/api/roles', [401]);
    await this.testEndpoint('GET', '/api/apikeys', [401]);
    await this.testEndpoint('POST', '/api/apikeys', [401]);
    await this.testEndpoint('GET', '/api/notifications', [401]);
    await this.testEndpoint('GET', '/api/subscriptions', [401]);
    await this.testEndpoint('GET', '/api/analytics', [401]);
    await this.testEndpoint('GET', '/api/automation', [401]);
    await this.testEndpoint('GET', '/api/custom-fields', [401]);
    await this.testEndpoint('GET', '/api/contactos-telefonicos', [401]);
    await this.testEndpoint('GET', '/api/account', [401]);
    await this.testEndpoint('GET', '/api/resumen', [401]);
    await this.testEndpoint('GET', '/api/debug', [401]);

    console.log('\n📊 RESULTADO FINAL:');
    this.showSummary();
  }

  showSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.expected).length;
    const failed = total - passed;
    const errors = this.results.filter(r => r.status === 'ERROR').length;

    console.log('='.repeat(50));
    console.log(`📊 RESUMEN DE PRUEBAS DE ENDPOINTS`);
    console.log('='.repeat(50));
    console.log(`Total probados: ${total}`);
    console.log(`✅ Pasaron: ${passed}`);
    console.log(`⚠️  Fallaron: ${failed}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📈 Tasa de éxito: ${((passed/total)*100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n🔍 ENDPOINTS CON PROBLEMAS:');
      this.results.filter(r => !r.expected).forEach(result => {
        console.log(`   ${result.method} ${result.path} - ${result.status}`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      });
    }

    console.log('='.repeat(50));
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  const tester = new EndpointTester();
  tester.testAllEndpoints().catch(console.error);
}

module.exports = EndpointTester;
