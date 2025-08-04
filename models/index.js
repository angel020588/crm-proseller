const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
require("dotenv").config();

const db = {};

if (!process.env.DATABASE_URL) {
  console.error(
    "❌ ERROR: DATABASE_URL no está configurada en el archivo .env",
  );
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
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
    idle: 10000,
  },
});

const basename = path.basename(__filename);

// Cargar todos los modelos del directorio
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js",
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
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
