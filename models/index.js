const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
require("dotenv").config();

const db = {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  },
);

// Cargar todos los modelos del directorio
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    console.log("🕵️ Cargando modelo:", file); // Debug mejorado
    try {
      const modelDefiner = require(path.join(__dirname, file));
      console.log("✅ Archivo cargado:", file, "- Tipo:", typeof modelDefiner);
      const ModelClass = modelDefiner(sequelize, Sequelize.DataTypes);
      console.log("✅ Modelo inicializado:", file, "- Nombre:", ModelClass.name);
      db[ModelClass.name] = ModelClass;
    } catch (error) {
      console.error("❌ ERROR en archivo:", file);
      console.error("❌ Error details:", error.message);
      throw error; // Re-lanzar para que el proceso falle y veamos el culpable
    }
  });

// Asociar modelos si tienen relaciones
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;