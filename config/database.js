
require('dotenv').config();
const { Pool } = require('pg');
const { Sequelize } = require('sequelize');

// Validar que DATABASE_URL esté configurada
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada en el archivo .env');
  process.exit(1);
}

console.log('✅ DATABASE_URL encontrada:', process.env.DATABASE_URL ? 'Sí' : 'No');

// Configuración de PostgreSQL usando la variable de entorno de Replit
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para ejecutar queries
const query = (text, params) => pool.query(text, params);

// Función para inicializar la base de datos
const initDatabase = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS contactos_telefonicos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        codigo_postal VARCHAR(10),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_contactos_telefono ON contactos_telefonicos(telefono);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_contactos_email ON contactos_telefonicos(email);
    `);

    console.log('✅ Tabla contactos_telefonicos creada exitosamente');
  } catch (error) {
    console.error('❌ Error creando tabla:', error);
  }
};

// Configuración de Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = {
  query,
  pool,
  initDatabase,
  sequelize,
  Sequelize
};
