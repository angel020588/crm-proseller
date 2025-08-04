
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Parsear manualmente la URL para evitar errores de Sequelize
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no está configurada');
}

// Extraer componentes de la URL manualmente
const url = new URL(databaseUrl);

const sequelize = new Sequelize({
  database: url.pathname.slice(1), // Remover el '/' inicial
  username: url.username,
  password: url.password,
  host: url.hostname,
  port: url.port || 5432,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
