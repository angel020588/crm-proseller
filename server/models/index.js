
// server/models/index.js
const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos usando el patrón function(sequelize, DataTypes)
db.User = require("./User")(sequelize, DataTypes);
db.Client = require("./Client")(sequelize, DataTypes);
db.Lead = require("./Lead")(sequelize, DataTypes);
db.Role = require("./Role")(sequelize, DataTypes);
db.ApiKey = require("./ApiKey")(sequelize, DataTypes);
db.Quotation = require("./Quotation")(sequelize, DataTypes);
db.Followup = require("./Followup")(sequelize, DataTypes);
db.Notification = require("./Notification")(sequelize, DataTypes);
db.Contact = require("./Contact")(sequelize, DataTypes);
db.ContactoTelefonico = require("./ContactoTelefonico")(sequelize, DataTypes);
db.Message = require("./Message")(sequelize, DataTypes);
db.Pipeline = require("./Pipeline")(sequelize, DataTypes);
db.Subscription = require("./Subscription")(sequelize, DataTypes);

// Configurar asociaciones automáticamente
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
