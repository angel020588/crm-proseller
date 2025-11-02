
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import and initialize models
const User = require('./User')(sequelize, DataTypes);
const Client = require('./Client')(sequelize, DataTypes);
const Lead = require('./Lead')(sequelize, DataTypes);
const Followup = require('./Followup')(sequelize, DataTypes);
const Quotation = require('./Quotation')(sequelize, DataTypes);
const ApiKey = require('./ApiKey')(sequelize, DataTypes);
const Role = require('./Role')(sequelize, DataTypes);
const Notification = require('./Notification')(sequelize, DataTypes);
const Subscription = require('./Subscription')(sequelize, DataTypes);

// Store models in an object
const models = {
  User,
  Client,
  Lead,
  Followup,
  Quotation,
  ApiKey,
  Role,
  Notification,
  Subscription
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export models and sequelize
module.exports = {
  sequelize,
  ...models
};

