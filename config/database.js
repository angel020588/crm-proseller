// config/database.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Asegúrate de tener esto correctamente en tu archivo .env:
// DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_db

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definido en .env");
}

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
