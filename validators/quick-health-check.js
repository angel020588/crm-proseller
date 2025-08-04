
const fs = require('fs');
const path = require('path');

class QuickHealthCheck {
  constructor() {
    this.issues = [];
    this.passed = [];
  }

  // ⚡ VERIFICACIÓN RÁPIDA DE ARCHIVOS CRÍTICOS
  checkCriticalFiles() {
    console.log('⚡ Verificación rápida de archivos críticos...\n');
    
    const criticalFiles = [
      { path: 'index.js', critical: true },
      { path: 'package.json', critical: true },
      { path: '.env.example', critical: false },
      { path: 'config/database.js', critical: true },
      { path: 'models/index.js', critical: true },
      { path: 'client/package.json', critical: true },
      { path: 'routes/ping.js', critical: false }
    ];

    criticalFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        this.passed.push(`✅ ${file.path}`);
      } else {
        const severity = file.critical ? '❌ CRÍTICO' : '⚠️  ADVERTENCIA';
        this.issues.push(`${severity}: ${file.path} no encontrado`);
      }
    });
  }

  // ⚡ VERIFICAR DEPENDENCIAS CLAVE
  checkDependencies() {
    console.log('⚡ Verificando dependencias clave...\n');
    
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredDeps = [
        'express', 'cors', 'dotenv', 'sequelize', 
        'pg', 'bcryptjs', 'jsonwebtoken'
      ];

      requiredDeps.forEach(dep => {
        if (pkg.dependencies && pkg.dependencies[dep]) {
          this.passed.push(`✅ Dependencia: ${dep}`);
        } else {
          this.issues.push(`❌ CRÍTICO: Dependencia faltante - ${dep}`);
        }
      });

      // Verificar scripts
      if (pkg.scripts && pkg.scripts.start) {
        this.passed.push('✅ Script start configurado');
      } else {
        this.issues.push('❌ CRÍTICO: Script start faltante');
      }

    } catch (error) {
      this.issues.push('❌ CRÍTICO: No se puede leer package.json');
    }
  }

  // ⚡ VERIFICAR RUTAS PRINCIPALES
  checkMainRoutes() {
    console.log('⚡ Verificando archivos de rutas...\n');
    
    const routeFiles = [
      'routes/auth.js',
      'routes/clients.js', 
      'routes/quotations.js',
      'routes/leads.js',
      'routes/ping.js'
    ];

    routeFiles.forEach(route => {
      if (fs.existsSync(route)) {
        this.passed.push(`✅ Ruta: ${route}`);
      } else {
        this.issues.push(`⚠️  Ruta faltante: ${route}`);
      }
    });
  }

  // ⚡ VERIFICAR ESTRUCTURA REACT
  checkReactBuild() {
    console.log('⚡ Verificando build de React...\n');
    
    if (fs.existsSync('client/build')) {
      this.passed.push('✅ Build de React existe');
      
      if (fs.existsSync('client/build/index.html')) {
        this.passed.push('✅ index.html del build existe');
      } else {
        this.issues.push('⚠️  index.html del build faltante');
      }
    } else {
      this.issues.push('⚠️  Build de React no encontrado - ejecuta npm run build');
    }
  }

  // 📊 MOSTRAR RESULTADOS RÁPIDOS
  showResults() {
    console.log('\n' + '='.repeat(50));
    console.log('⚡ RESULTADO DE VERIFICACIÓN RÁPIDA');
    console.log('='.repeat(50));
    
    console.log(`\n✅ ELEMENTOS OK: ${this.passed.length}`);
    this.passed.forEach(item => console.log(`   ${item}`));
    
    if (this.issues.length > 0) {
      console.log(`\n🚨 PROBLEMAS ENCONTRADOS: ${this.issues.length}`);
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    } else {
      console.log('\n🎉 ¡Todo parece estar bien!');
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (this.issues.some(issue => issue.includes('CRÍTICO'))) {
      console.log('🚨 HAY PROBLEMAS CRÍTICOS - Revisar inmediatamente');
    } else if (this.issues.length > 0) {
      console.log('⚠️  Hay algunas advertencias menores');
    } else {
      console.log('✅ Sistema aparenta estar saludable');
    }
    
    console.log('='.repeat(50));
  }

  // 🚀 EJECUTAR VERIFICACIÓN COMPLETA
  runQuickCheck() {
    console.log('🚀 Iniciando verificación rápida del CRM...\n');
    
    this.checkCriticalFiles();
    this.checkDependencies();
    this.checkMainRoutes();
    this.checkReactBuild();
    this.showResults();
  }
}

// Ejecutar verificación rápida
if (require.main === module) {
  const healthCheck = new QuickHealthCheck();
  healthCheck.runQuickCheck();
}

module.exports = QuickHealthCheck;
