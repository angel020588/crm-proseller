
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está configurada');
    return;
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Leer y ejecutar el script SQL
    const sqlScript = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');
    await client.query(sqlScript);
    
    console.log('✅ Tabla contactos_telefonicos creada exitosamente');
    console.log('✅ Datos de ejemplo insertados');

    // Verificar que la tabla existe
    const result = await client.query(`
      SELECT COUNT(*) as total FROM contactos_telefonicos;
    `);
    
    console.log(`📊 Total de contactos: ${result.rows[0].total}`);

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  } finally {
    await client.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
