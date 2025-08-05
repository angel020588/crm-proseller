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
  logging: false, // Puedes activarlo si quieres ver los queries en consola
});

module.exports = sequelize;
