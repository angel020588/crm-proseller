
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Iniciando reparación completa del CRM...\n');

// 1. Verificar estructura de directorios
const requiredDirs = ['routes', 'models', 'controllers', 'middleware', 'config', 'client/src', 'client/build'];
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Directorio creado: ${dir}`);
  }
});

// 2. Verificar archivos críticos
const criticalFiles = [
  { path: 'package.json', required: true },
  { path: 'index.js', required: true },
  { path: '.env', required: false },
  { path: 'client/package.json', required: true }
];

criticalFiles.forEach(file => {
  if (file.required && !fs.existsSync(file.path)) {
    console.log(`❌ Archivo crítico faltante: ${file.path}`);
  } else if (fs.existsSync(file.path)) {
    console.log(`✅ Archivo encontrado: ${file.path}`);
  }
});

// 3. Instalar dependencias
try {
  console.log('\n📦 Instalando dependencias del backend...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n📦 Instalando dependencias del frontend...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  console.log('\n🏗️ Construyendo frontend...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Todas las dependencias instaladas y frontend construido');
} catch (error) {
  console.error('\n❌ Error durante la instalación:', error.message);
}

console.log('\n🎉 Reparación completa finalizada!');
console.log('Para iniciar el servidor: npm start');
