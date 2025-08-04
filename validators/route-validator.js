
const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class CRMRouteValidator {
  constructor(baseUrl = 'http://0.0.0.0:3000') {
    this.baseUrl = baseUrl;
    this.errors = [];
    this.warnings = [];
    this.validatedRoutes = new Set();
    this.staticFiles = new Set();
  }

  // 🔍 VALIDAR TODAS LAS RUTAS API
  async validateAPIRoutes() {
    console.log('🔍 Validando rutas API del CRM...\n');
    
    const apiRoutes = [
      // Rutas de autenticación
      { method: 'POST', path: '/api/auth/login', requiresAuth: false },
      { method: 'POST', path: '/api/auth/register', requiresAuth: false },
      { method: 'GET', path: '/api/ping', requiresAuth: false },
      
      // Rutas principales (requieren auth)
      { method: 'GET', path: '/api/clients', requiresAuth: true },
      { method: 'POST', path: '/api/clients', requiresAuth: true },
      { method: 'GET', path: '/api/quotations', requiresAuth: true },
      { method: 'POST', path: '/api/quotations', requiresAuth: true },
      { method: 'GET', path: '/api/leads', requiresAuth: true },
      { method: 'POST', path: '/api/leads', requiresAuth: true },
      { method: 'GET', path: '/api/followups', requiresAuth: true },
      { method: 'POST', path: '/api/followups', requiresAuth: true },
      { method: 'GET', path: '/api/dashboard', requiresAuth: true },
      { method: 'GET', path: '/api/users', requiresAuth: true },
      { method: 'GET', path: '/api/roles', requiresAuth: true },
      { method: 'GET', path: '/api/apikeys', requiresAuth: true },
      { method: 'POST', path: '/api/apikeys', requiresAuth: true },
      { method: 'GET', path: '/api/notifications', requiresAuth: true },
      { method: 'GET', path: '/api/subscriptions', requiresAuth: true },
      { method: 'GET', path: '/api/analytics', requiresAuth: true },
      { method: 'GET', path: '/api/automation', requiresAuth: true },
      { method: 'GET', path: '/api/custom-fields', requiresAuth: true },
      { method: 'GET', path: '/api/contactos-telefonicos', requiresAuth: true },
      { method: 'GET', path: '/api/account', requiresAuth: true },
      { method: 'POST', path: '/api/supabase-clients', requiresAuth: false },
      { method: 'POST', path: '/api/webhook', requiresAuth: false },
      { method: 'GET', path: '/api/resumen', requiresAuth: true },
      { method: 'GET', path: '/api/debug', requiresAuth: true }
    ];

    for (const route of apiRoutes) {
      await this.testAPIRoute(route);
    }
  }

  async testAPIRoute(route) {
    try {
      const url = `${this.baseUrl}${route.path}`;
      const config = {
        method: route.method,
        timeout: 5000,
        validateStatus: (status) => status < 500 // Aceptar códigos de error esperados
      };

      // Para rutas que requieren auth, probar sin token primero
      if (route.requiresAuth) {
        try {
          const response = await axios(url, config);
          if (response.status === 401) {
            console.log(`✅ ${route.method} ${route.path} - Protegida correctamente (401)`);
          } else {
            this.warnings.push(`⚠️  ${route.method} ${route.path} - Debería requerir autenticación pero devuelve ${response.status}`);
          }
        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            this.errors.push(`❌ ${route.method} ${route.path} - Servidor no disponible`);
          } else {
            this.errors.push(`❌ ${route.method} ${route.path} - Error: ${error.message}`);
          }
        }
      } else {
        // Para rutas públicas
        try {
          const response = await axios(url, config);
          if (response.status >= 200 && response.status < 400) {
            console.log(`✅ ${route.method} ${route.path} - OK (${response.status})`);
          } else {
            this.warnings.push(`⚠️  ${route.method} ${route.path} - Status inesperado: ${response.status}`);
          }
        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            this.errors.push(`❌ ${route.method} ${route.path} - Servidor no disponible`);
          } else {
            this.errors.push(`❌ ${route.method} ${route.path} - Error: ${error.message}`);
          }
        }
      }
      
      this.validatedRoutes.add(`${route.method} ${route.path}`);
    } catch (error) {
      this.errors.push(`❌ Error validando ${route.method} ${route.path}: ${error.message}`);
    }
  }

  // 🔍 VALIDAR ARCHIVOS ESTÁTICOS Y HTML
  async validateStaticFiles() {
    console.log('\n🔍 Validando archivos estáticos...\n');
    
    const htmlFiles = [
      'index.html',
      'clients.html',
      'quotations.html',
      'followups.html',
      'plantillas.html',
      'respuestas.html',
      'contactos.html',
      'estadisticas.html',
      'integraciones.html',
      'soporte.html',
      'iapersonalizada.html',
      'conectar.html'
    ];

    const staticAssets = [
      'estilos.css',
      'tailwind.config.js',
      'client/public/favicon.ico',
      'client/public/manifest.json',
      'client/public/crm-info.html'
    ];

    // Validar archivos HTML
    for (const file of htmlFiles) {
      await this.validateFile(file, 'HTML');
    }

    // Validar assets estáticos
    for (const file of staticAssets) {
      await this.validateFile(file, 'ASSET');
    }
  }

  async validateFile(filePath, type) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${type}: ${filePath} - Existe`);
        this.staticFiles.add(filePath);
        
        if (type === 'HTML') {
          await this.validateHTMLContent(filePath);
        }
      } else {
        this.errors.push(`❌ ${type}: ${filePath} - Archivo no encontrado`);
      }
    } catch (error) {
      this.errors.push(`❌ Error validando ${filePath}: ${error.message}`);
    }
  }

  async validateHTMLContent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Verificar enlaces internos
      const linkRegex = /href=["']([^"']+)["']/g;
      const scriptRegex = /src=["']([^"']+)["']/g;
      let match;

      // Validar enlaces href
      while ((match = linkRegex.exec(content)) !== null) {
        const link = match[1];
        if (this.isInternalLink(link)) {
          await this.validateInternalLink(link, filePath);
        }
      }

      // Validar scripts src
      while ((match = scriptRegex.exec(content)) !== null) {
        const src = match[1];
        if (this.isInternalResource(src)) {
          await this.validateInternalResource(src, filePath);
        }
      }
    } catch (error) {
      this.errors.push(`❌ Error leyendo contenido de ${filePath}: ${error.message}`);
    }
  }

  isInternalLink(link) {
    return !link.startsWith('http') && 
           !link.startsWith('mailto:') && 
           !link.startsWith('tel:') &&
           !link.startsWith('#') &&
           !link.startsWith('javascript:');
  }

  isInternalResource(src) {
    return !src.startsWith('http') && 
           !src.startsWith('//') &&
           !src.startsWith('data:');
  }

  async validateInternalLink(link, sourceFile) {
    const targetFile = link.startsWith('/') ? link.substring(1) : link;
    if (!fs.existsSync(targetFile)) {
      this.errors.push(`❌ Enlace roto en ${sourceFile}: ${link} -> ${targetFile}`);
    }
  }

  async validateInternalResource(src, sourceFile) {
    const targetFile = src.startsWith('/') ? src.substring(1) : src;
    if (!fs.existsSync(targetFile)) {
      this.warnings.push(`⚠️  Recurso no encontrado en ${sourceFile}: ${src} -> ${targetFile}`);
    }
  }

  // 🔍 VALIDAR CONFIGURACIÓN DEL SERVIDOR
  validateServerConfig() {
    console.log('\n🔍 Validando configuración del servidor...\n');
    
    const criticalFiles = [
      { path: 'index.js', type: 'Servidor principal' },
      { path: 'package.json', type: 'Configuración NPM' },
      { path: '.env.example', type: 'Variables de entorno' },
      { path: 'config/database.js', type: 'Configuración DB' },
      { path: 'models/index.js', type: 'Modelos Sequelize' }
    ];

    criticalFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        console.log(`✅ ${file.type}: ${file.path} - OK`);
        this.validateFileContent(file.path, file.type);
      } else {
        this.errors.push(`❌ ${file.type}: ${file.path} - Archivo crítico faltante`);
      }
    });
  }

  validateFileContent(filePath, type) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (filePath === 'index.js') {
        // Verificar imports críticos
        const criticalImports = [
          'express',
          'cors',
          'dotenv',
          './config/database',
          './models'
        ];
        
        criticalImports.forEach(imp => {
          if (!content.includes(imp)) {
            this.warnings.push(`⚠️  ${filePath}: Posible import faltante - ${imp}`);
          }
        });

        // Verificar configuración de puerto
        if (!content.includes('PORT') || !content.includes('listen')) {
          this.errors.push(`❌ ${filePath}: Configuración de puerto faltante`);
        }
      }

      if (filePath === 'package.json') {
        try {
          const pkg = JSON.parse(content);
          if (!pkg.scripts || !pkg.scripts.start) {
            this.errors.push(`❌ ${filePath}: Script 'start' faltante`);
          }
          if (!pkg.dependencies || !pkg.dependencies.express) {
            this.errors.push(`❌ ${filePath}: Dependencia 'express' faltante`);
          }
        } catch (error) {
          this.errors.push(`❌ ${filePath}: JSON malformado`);
        }
      }
    } catch (error) {
      this.errors.push(`❌ Error leyendo ${filePath}: ${error.message}`);
    }
  }

  // 🔍 VALIDAR ESTRUCTURA DE DIRECTORIOS
  validateDirectoryStructure() {
    console.log('\n🔍 Validando estructura de directorios...\n');
    
    const requiredDirs = [
      { path: 'config', desc: 'Configuraciones' },
      { path: 'models', desc: 'Modelos de datos' },
      { path: 'routes', desc: 'Rutas API' },
      { path: 'middleware', desc: 'Middlewares' },
      { path: 'controllers', desc: 'Controladores' },
      { path: 'client', desc: 'Frontend React' },
      { path: 'client/src', desc: 'Código fuente React' },
      { path: 'client/build', desc: 'Build de producción' }
    ];

    requiredDirs.forEach(dir => {
      if (fs.existsSync(dir.path) && fs.statSync(dir.path).isDirectory()) {
        console.log(`✅ Directorio: ${dir.path} (${dir.desc}) - OK`);
      } else {
        this.warnings.push(`⚠️  Directorio faltante: ${dir.path} (${dir.desc})`);
      }
    });
  }

  // 📊 GENERAR REPORTE COMPLETO
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE COMPLETO DE VALIDACIÓN CRM PROSELLER');
    console.log('='.repeat(60));
    
    console.log(`\n🔍 ESTADÍSTICAS:`);
    console.log(`   • Rutas API validadas: ${this.validatedRoutes.size}`);
    console.log(`   • Archivos estáticos encontrados: ${this.staticFiles.size}`);
    console.log(`   • Errores críticos: ${this.errors.length}`);
    console.log(`   • Advertencias: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORES CRÍTICOS (${this.errors.length}):`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  ADVERTENCIAS (${this.warnings.length}):`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 ¡EXCELENTE! No se encontraron problemas críticos.');
      console.log('✅ Tu CRM ProSeller está correctamente configurado.');
    } else if (this.errors.length === 0) {
      console.log('\n✅ No hay errores críticos, solo algunas advertencias menores.');
    } else {
      console.log('\n🚨 Se encontraron errores que requieren atención inmediata.');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🔧 RECOMENDACIONES:');
    console.log('   1. Corrige los errores críticos primero');
    console.log('   2. Revisa las advertencias para optimizar');
    console.log('   3. Ejecuta este validador regularmente');
    console.log('   4. Mantén actualizada la documentación');
    console.log('='.repeat(60));
  }

  // 🚀 EJECUTAR VALIDACIÓN COMPLETA
  async runCompleteValidation() {
    console.log('🚀 Iniciando validación completa del CRM ProSeller...\n');
    
    try {
      // 1. Validar estructura de directorios
      this.validateDirectoryStructure();
      
      // 2. Validar configuración del servidor
      this.validateServerConfig();
      
      // 3. Validar archivos estáticos
      await this.validateStaticFiles();
      
      // 4. Validar rutas API (requiere servidor corriendo)
      await this.validateAPIRoutes();
      
      // 5. Generar reporte final
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Error durante la validación:', error.message);
      this.errors.push(`Error general: ${error.message}`);
      this.generateReport();
    }
  }

  // 💾 GUARDAR REPORTE EN ARCHIVO
  saveReportToFile() {
    const reportData = {
      timestamp: new Date().toISOString(),
      stats: {
        validatedRoutes: this.validatedRoutes.size,
        staticFiles: this.staticFiles.size,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      errors: this.errors,
      warnings: this.warnings,
      validatedRoutes: Array.from(this.validatedRoutes),
      staticFiles: Array.from(this.staticFiles)
    };

    const fileName = `validation-report-${new Date().toISOString().slice(0, 10)}.json`;
    fs.writeFileSync(fileName, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Reporte guardado en: ${fileName}`);
  }
}

// 🎯 FUNCIÓN PRINCIPAL DE EJECUCIÓN
async function runValidation() {
  const validator = new CRMRouteValidator();
  await validator.runCompleteValidation();
  validator.saveReportToFile();
}

// Exportar para uso externo
module.exports = { CRMRouteValidator, runValidation };

// Ejecutar si se llama directamente
if (require.main === module) {
  runValidation().catch(console.error);
}
