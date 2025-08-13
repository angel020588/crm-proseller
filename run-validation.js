#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class CRMValidationSystem {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
    this.startTime = Date.now();
  }

  // 🚀 VALIDACIÓN RÁPIDA DE ARCHIVOS CRÍTICOS
  validateCriticalFiles() {
    console.log('🔍 Validando archivos críticos...\n');
    
    const criticalFiles = [
      { path: 'index.js', desc: 'Servidor principal' },
      { path: 'package.json', desc: 'Dependencias backend' },
      { path: 'client/package.json', desc: 'Dependencias frontend' },
      { path: 'config/database.js', desc: 'Configuración DB' },
      { path: 'models/index.js', desc: 'Modelos de datos' },
      { path: 'routes/auth.js', desc: 'Autenticación' },
      { path: 'middlewares/verifyToken.js', desc: 'Middleware JWT' },
      { path: '.env.example', desc: 'Variables de entorno' }
    ];

    criticalFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        this.passed.push(`✅ ${file.desc}: ${file.path}`);
      } else {
        this.errors.push(`❌ CRÍTICO: ${file.desc} faltante: ${file.path}`);
      }
    });
  }

  // 📊 VALIDAR ESTRUCTURA DE DIRECTORIOS
  validateDirectoryStructure() {
    console.log('📂 Validando estructura de directorios...\n');
    
    const requiredDirs = [
      'client/src/pages',
      'client/public', 
      'routes',
      'models',
      'config',
      'middlewares',
      'controllers',
      'seeders'
    ];

    requiredDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.passed.push(`✅ Directorio: ${dir}`);
      } else {
        this.warnings.push(`⚠️ Directorio opcional faltante: ${dir}`);
      }
    });
  }

  // 🔌 VALIDAR DEPENDENCIAS
  validateDependencies() {
    console.log('📦 Validando dependencias...\n');
    
    try {
      // Backend dependencies
      const backendPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredBackendDeps = [
        'express', 'cors', 'dotenv', 'sequelize', 'pg', 
        'bcryptjs', 'jsonwebtoken', 'axios'
      ];

      requiredBackendDeps.forEach(dep => {
        if (backendPkg.dependencies && backendPkg.dependencies[dep]) {
          this.passed.push(`✅ Backend dep: ${dep}`);
        } else {
          this.errors.push(`❌ Backend dep faltante: ${dep}`);
        }
      });

      // Frontend dependencies
      if (fs.existsSync('client/package.json')) {
        const frontendPkg = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
        const requiredFrontendDeps = ['react', 'react-dom', 'axios'];

        requiredFrontendDeps.forEach(dep => {
          if (frontendPkg.dependencies && frontendPkg.dependencies[dep]) {
            this.passed.push(`✅ Frontend dep: ${dep}`);
          } else {
            this.errors.push(`❌ Frontend dep faltante: ${dep}`);
          }
        });
      }

    } catch (error) {
      this.errors.push(`❌ Error leyendo package.json: ${error.message}`);
    }
  }

  // 🛣️ VALIDAR RUTAS API
  validateAPIRoutes() {
    console.log('🛣️ Validando rutas API...\n');
    
    const expectedRoutes = [
      'auth.js', 'clients.js', 'leads.js', 'quotations.js',
      'followups.js', 'apikeys.js', 'dashboard.js', 'users.js',
      'roles.js', 'notifications.js', 'subscriptions.js'
    ];

    expectedRoutes.forEach(route => {
      const routePath = `routes/${route}`;
      if (fs.existsSync(routePath)) {
        this.passed.push(`✅ Ruta: ${route}`);
      } else {
        this.warnings.push(`⚠️ Ruta opcional faltante: ${route}`);
      }
    });
  }

  // 🔒 VALIDAR CONFIGURACIÓN DE SEGURIDAD
  validateSecurity() {
    console.log('🔒 Validando configuración de seguridad...\n');
    
    // Verificar middleware de autenticación
    if (fs.existsSync('middlewares/verifyToken.js')) {
      const middleware = fs.readFileSync('middlewares/verifyToken.js', 'utf8');
      if (middleware.includes('jsonwebtoken') && middleware.includes('authorization')) {
        this.passed.push('✅ Middleware JWT configurado');
      } else {
        this.errors.push('❌ Middleware JWT mal configurado');
      }
    }

    // Verificar variables de entorno
    if (fs.existsSync('.env.example')) {
      const envExample = fs.readFileSync('.env.example', 'utf8');
      const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
      
      requiredVars.forEach(envVar => {
        if (envExample.includes(envVar)) {
          this.passed.push(`✅ Variable env: ${envVar}`);
        } else {
          this.warnings.push(`⚠️ Variable env faltante en ejemplo: ${envVar}`);
        }
      });
    }
  }

  // 🗄️ VALIDAR MODELOS DE BASE DE DATOS
  validateDatabaseModels() {
    console.log('🗄️ Validando modelos de base de datos...\n');
    
    const expectedModels = [
      'User.js', 'Client.js', 'Lead.js', 'Quotation.js',
      'Followup.js', 'ApiKey.js', 'Role.js'
    ];

    expectedModels.forEach(model => {
      const modelPath = `models/${model}`;
      if (fs.existsSync(modelPath)) {
        this.passed.push(`✅ Modelo: ${model}`);
      } else {
        this.warnings.push(`⚠️ Modelo opcional faltante: ${model}`);
      }
    });
  }

  // 🎨 VALIDAR FRONTEND REACT
  validateFrontend() {
    console.log('🎨 Validando frontend React...\n');
    
    if (fs.existsSync('client/src/App.js')) {
      this.passed.push('✅ App.js principal encontrado');
    } else {
      this.errors.push('❌ App.js principal faltante');
    }

    const expectedPages = [
      'Login.jsx', 'Dashboard.jsx', 'Clients.jsx', 'Leads.jsx',
      'Quotations.jsx', 'ApiKeys.jsx'
    ];

    expectedPages.forEach(page => {
      const pagePath = `client/src/pages/${page}`;
      if (fs.existsSync(pagePath)) {
        this.passed.push(`✅ Página: ${page}`);
      } else {
        this.warnings.push(`⚠️ Página opcional faltante: ${page}`);
      }
    });

    // Verificar build del frontend
    if (fs.existsSync('client/build')) {
      this.passed.push('✅ Build de React existe');
    } else {
      this.warnings.push('⚠️ Build de React no encontrado - ejecutar npm run build');
    }
  }

  // 🧪 PROBAR ENDPOINTS EN VIVO
  async testLiveEndpoints() {
    console.log('🧪 Probando endpoints en vivo...\n');
    
    const baseURL = 'http://0.0.0.0:5000/api';
    const endpoints = [
      { path: '/ping', method: 'GET' },
      { path: '/auth', method: 'POST' },
      { path: '/clients', method: 'GET' },
      { path: '/dashboard', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${baseURL}${endpoint.path}`,
          timeout: 3000,
          validateStatus: () => true
        });

        if (response.status < 500) {
          this.passed.push(`✅ Endpoint ${endpoint.method} ${endpoint.path}: ${response.status}`);
        } else {
          this.warnings.push(`⚠️ Endpoint ${endpoint.method} ${endpoint.path}: ${response.status}`);
        }
      } catch (error) {
        this.warnings.push(`⚠️ Endpoint ${endpoint.method} ${endpoint.path}: Sin conexión`);
      }
    }
  }

  // 📋 GENERAR REPORTE FINAL
  generateReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 REPORTE FINAL DE VALIDACIÓN CRM PROSELLER');
    console.log('='.repeat(60));
    
    console.log(`\n✅ ELEMENTOS VALIDADOS CORRECTAMENTE: ${this.passed.length}`);
    this.passed.forEach(item => console.log(`   ${item}`));
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  ADVERTENCIAS: ${this.warnings.length}`);
      this.warnings.forEach(item => console.log(`   ${item}`));
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORES CRÍTICOS: ${this.errors.length}`);
      this.errors.forEach(item => console.log(`   ${item}`));
    }
    
    console.log(`\n⏱️  Tiempo de validación: ${duration}s`);
    
    // Evaluación final
    if (this.errors.length === 0) {
      console.log('\n🎉 ¡SISTEMA LISTO PARA DEPLOY!');
      console.log('✅ Todos los componentes críticos están en su lugar');
    } else {
      console.log('\n🚨 DEPLOY NO RECOMENDADO');
      console.log(`❌ Corrige ${this.errors.length} error(es) crítico(s) primero`);
    }
    
    console.log('='.repeat(60));

    // Guardar reporte
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      passed: this.passed,
      warnings: this.warnings,
      errors: this.errors,
      deployReady: this.errors.length === 0
    };

    const reportFile = `validation-report-${new Date().toISOString().slice(0, 10)}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Reporte guardado en: ${reportFile}`);
  }

  // 🚀 EJECUTAR VALIDACIÓN COMPLETA
  async runCompleteValidation() {
    console.log('🎯 INICIANDO VALIDACIÓN COMPLETA DEL CRM PROSELLER');
    console.log('='.repeat(60));
    
    this.validateCriticalFiles();
    this.validateDirectoryStructure();
    this.validateDependencies();
    this.validateAPIRoutes();
    this.validateSecurity();
    this.validateDatabaseModels();
    this.validateFrontend();
    
    console.log('\n⏳ Probando endpoints en vivo...');
    await this.testLiveEndpoints();
    
    this.generateReport();
  }
}

// 🎯 EJECUCIÓN PRINCIPAL
if (require.main === module) {
  const validator = new CRMValidationSystem();
  validator.runCompleteValidation().catch(error => {
    console.error('❌ Error durante validación:', error.message);
  });
}

module.exports = CRMValidationSystem;
