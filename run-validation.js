// run-validation.js
// Si estás usando el shebang arriba de este comentario puede causar error
// Por seguridad eliminamos la primera línea "#!/usr/bin/env node"

const { CRMRouteValidator } = require('./validators/route-validator');
const QuickHealthCheck = require('./validators/quick‑health‑check');
const EndpointTester = require('./test‑all‑endpoints');

async function runAllValidations() {
  console.log('🎯 SISTEMA DE VALIDACIÓN COMPLETA - CRM PROSELLER');
  console.log('='.repeat(60));
  console.log('Iniciando validaciones automáticas...\n');

  try {
    console.log('🔥 PASO 1: VERIFICACIÓN RÁPIDA DE SALUD');
    console.log('-'.repeat(40));
    const healthCheck = new QuickHealthCheck();
    healthCheck.runQuickCheck();

    console.log('\n⏳ Esperando 3 segundos antes de continuar...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔍 PASO 2: VALIDACIÓN COMPLETA DE RUTAS');
    console.log('-'.repeat(40));
    const routeValidator = new CRMRouteValidator();
    await routeValidator.runCompleteValidation();
    routeValidator.saveReportToFile();

    console.log('\n⏳ Esperando 5 segundos antes de probar endpoints...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🧪 PASO 3: PRUEBA DE ENDPOINTS');
    console.log('-'.repeat(40));
    console.log('ℹ️  Nota: Asegúrate de que el servidor esté corriendo en puerto 3000');
    console.log('   Si no está corriendo, algunos tests fallarán (es normal).\n');

    const endpointTester = new EndpointTester();
    await endpointTester.testAllEndpoints();

    console.log('\n🎉 VALIDACIÓN COMPLETA TERMINADA');
    console.log('='.repeat(60));
    console.log('✅ Todos los validadores han terminado');
    console.log('📄 Revisa los reportes generados para más detalles');
    console.log('🔧 Corrige cualquier problema encontrado');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error durante la validación:', error.message);
    console.error('🔧 Verifica que todos los archivos estén en su lugar');
  }
}

async function runBasicValidation() {
  console.log('⚡ VALIDACIÓN BÁSICA - CRM PROSELLER');
  console.log('='.repeat(40));
  const healthCheck = new QuickHealthCheck();
  healthCheck.runQuickCheck();
}

async function runEndpointTests() {
  console.log('🧪 PRUEBA DE ENDPOINTS - CRM PROSELLER');
  console.log('='.repeat(40));
  const tester = new EndpointTester();
  await tester.testAllEndpoints();
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--basic')) {
    runBasicValidation();
  } else if (args.includes('--endpoints')) {
    runEndpointTests();
  } else if (args.includes('--help')) {
    console.log('🎯 SISTEMA DE VALIDACIÓN CRM PROSELLER');
    console.log('=====================================');
    console.log('Uso: node run-validation.js [opciones]');
    console.log('');
    console.log('Opciones:');
    console.log('  --basic      Solo verificación rápida');
    console.log('  --endpoints  Solo prueba de endpoints');
    console.log('  --help       Mostrar esta ayuda');
    console.log('  (sin args)   Ejecutar validación completa');
  } else {
    runAllValidations();
  }
}

module.exports = {
  runAllValidations,
  runBasicValidation,
  runEndpointTests
};
