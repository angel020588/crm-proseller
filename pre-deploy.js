
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 PREPARANDO CRM PROSELLER PARA DEPLOY');
console.log('='.repeat(50));

try {
  // 1. Verificar estructura
  console.log('1️⃣ Verificando estructura...');
  
  // 2. Instalar dependencias del frontend
  console.log('2️⃣ Instalando dependencias del frontend...');
  if (fs.existsSync('client/package.json')) {
    execSync('cd client && npm install', { stdio: 'inherit' });
  }
  
  // 3. Construir frontend
  console.log('3️⃣ Construyendo frontend React...');
  if (fs.existsSync('client/package.json')) {
    execSync('cd client && npm run build', { stdio: 'inherit' });
  }
  
  // 4. Instalar dependencias del backend
  console.log('4️⃣ Instalando dependencias del backend...');
  execSync('npm install', { stdio: 'inherit' });
  
  // 5. Ejecutar validaciones
  console.log('5️⃣ Ejecutando validaciones...');
  execSync('node run-validation.js', { stdio: 'inherit' });
  
  console.log('\n✅ PREPARACIÓN COMPLETA');
  console.log('🎯 Sistema listo para deploy en Replit');
  
} catch (error) {
  console.error('❌ Error en preparación:', error.message);
  process.exit(1);
}
