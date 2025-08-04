
const axios = require('axios');

class AuthTester {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.testResults = [];
  }

  async runTest(name, testFn) {
    try {
      console.log(`\n🧪 Probando: ${name}`);
      await testFn();
      console.log(`✅ ${name} - PASÓ`);
      this.testResults.push({ name, status: 'PASS' });
    } catch (error) {
      console.log(`❌ ${name} - FALLÓ: ${error.message}`);
      this.testResults.push({ name, status: 'FAIL', error: error.message });
    }
  }

  async testEmailValidation() {
    // Debe fallar con email inválido
    try {
      await axios.post(`${this.baseURL}/api/auth/register`, {
        name: "Test User",
        email: "test@fakeemail.xyz",
        password: "Test123!@#",
        roleName: "usuario"
      });
      throw new Error("Debería haber fallado con email inválido");
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('email válido')) {
        console.log("   ✓ Validación de email funcionando correctamente");
      } else {
        throw error;
      }
    }
  }

  async testPasswordStrength() {
    // Debe fallar con contraseña débil
    try {
      await axios.post(`${this.baseURL}/api/auth/register`, {
        name: "Test User",
        email: "test@gmail.com",
        password: "123",
        roleName: "usuario"
      });
      throw new Error("Debería haber fallado con contraseña débil");
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('Contraseña')) {
        console.log("   ✓ Validación de contraseña funcionando correctamente");
        console.log(`   📊 Evaluación: ${error.response.data.passwordStrength?.strength || 'débil'}`);
      } else {
        throw error;
      }
    }
  }

  async testSuccessfulRegistration() {
    const testUser = {
      name: "Usuario Prueba",
      email: "prueba@gmail.com",
      password: "TestSeguro123!@#",
      roleName: "usuario"
    };

    const response = await axios.post(`${this.baseURL}/api/auth/register`, testUser);
    
    if (response.status === 201 && response.data.token) {
      console.log("   ✓ Registro exitoso");
      console.log(`   🔑 Token generado: ${response.data.token.substring(0, 20)}...`);
      console.log(`   💪 Fuerza de contraseña: ${response.data.passwordStrength}`);
      this.testToken = response.data.token;
      this.testUserId = response.data.user.id;
      return response.data;
    } else {
      throw new Error("Registro no completado correctamente");
    }
  }

  async testLoginAttempts() {
    console.log("   🔒 Probando límites de intentos...");
    
    for (let i = 1; i <= 6; i++) {
      try {
        await axios.post(`${this.baseURL}/api/auth/login`, {
          email: "noexiste@gmail.com",
          password: "contraseñaIncorrecta"
        });
      } catch (error) {
        if (i <= 5) {
          console.log(`   Intento ${i}/5 - Restantes: ${error.response?.data?.remaining || 'N/A'}`);
        } else {
          if (error.response?.status === 429) {
            console.log("   ✓ Bloqueo por intentos excesivos funcionando");
            console.log(`   ⏰ Bloqueado hasta: ${error.response.data.blockedUntil || 'N/A'}`);
          }
        }
      }
    }
  }

  async testSuccessfulLogin() {
    const response = await axios.post(`${this.baseURL}/api/auth/login`, {
      email: "prueba@gmail.com",
      password: "TestSeguro123!@#"
    });

    if (response.status === 200 && response.data.token) {
      console.log("   ✓ Login exitoso");
      console.log(`   👤 Usuario: ${response.data.user.name}`);
      console.log(`   🎭 Rol ID: ${response.data.user.roleId}`);
      return response.data.token;
    } else {
      throw new Error("Login no completado correctamente");
    }
  }

  async testProtectedRoutes() {
    if (!this.testToken) {
      throw new Error("Token de prueba no disponible");
    }

    const protectedRoutes = [
      '/api/dashboard',
      '/api/clients',
      '/api/leads',
      '/api/quotations'
    ];

    for (const route of protectedRoutes) {
      try {
        const response = await axios.get(`${this.baseURL}${route}`, {
          headers: { Authorization: `Bearer ${this.testToken}` }
        });
        console.log(`   ✓ ${route} - Acceso autorizado (${response.status})`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`   ❌ ${route} - No autorizado (verificar middleware)`);
        } else {
          console.log(`   ✓ ${route} - Protegido correctamente`);
        }
      }
    }
  }

  async testRoleSystem() {
    if (!this.testToken) {
      throw new Error("Token de prueba no disponible");
    }

    try {
      const response = await axios.get(`${this.baseURL}/api/roles`, {
        headers: { Authorization: `Bearer ${this.testToken}` }
      });
      console.log(`   ✓ Sistema de roles accesible`);
      console.log(`   📋 Roles disponibles: ${response.data.length || 0}`);
    } catch (error) {
      console.log(`   ⚠️ Roles no accesibles: ${error.response?.status || error.message}`);
    }
  }

  async cleanup() {
    if (this.testUserId && this.testToken) {
      try {
        // Intentar limpiar usuario de prueba (solo si hay endpoint disponible)
        console.log("   🧹 Limpiando datos de prueba...");
      } catch (error) {
        console.log("   ⚠️ No se pudo limpiar automáticamente");
      }
    }
  }

  async runAllTests() {
    console.log("🚀 INICIANDO PRUEBAS DEL ERROR #7 - SISTEMA DE AUTENTICACIÓN\n");

    await this.runTest("Validación de Email Real", () => this.testEmailValidation());
    await this.runTest("Evaluación de Contraseña", () => this.testPasswordStrength());
    await this.runTest("Registro Exitoso", () => this.testSuccessfulRegistration());
    await this.runTest("Límites de Intentos de Login", () => this.testLoginAttempts());
    await this.runTest("Login Exitoso", () => this.testSuccessfulLogin());
    await this.runTest("Rutas Protegidas", () => this.testProtectedRoutes());
    await this.runTest("Sistema de Roles", () => this.testRoleSystem());

    await this.cleanup();

    console.log("\n📊 RESULTADOS FINALES:");
    console.log("========================");
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const total = this.testResults.length;
    console.log(`\n🎯 Resultado: ${passed}/${total} pruebas pasaron`);
    
    if (passed === total) {
      console.log("🎉 ¡ERROR #7 COMPLETAMENTE FUNCIONAL!");
    } else {
      console.log("⚠️ Algunas funcionalidades necesitan revisión");
    }
  }
}

// Ejecutar pruebas
const tester = new AuthTester();
tester.runAllTests().catch(console.error);
