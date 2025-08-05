
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import all models
const User = require('./User');
const Client = require('./Client');
const Lead = require('./Lead');
const Followup = require('./Followup');
const Quotation = require('./Quotation');
const ApiKey = require('./ApiKey');
const Role = require('./Role');
const Notification = require('./Notification');
const Subscription = require('./Subscription');

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Client, { foreignKey: 'assignedTo', as: 'clients' });
  User.hasMany(Lead, { foreignKey: 'assignedTo', as: 'leads' });
  User.hasMany(Followup, { foreignKey: 'assignedTo', as: 'followups' });
  User.hasMany(Quotation, { foreignKey: 'assignedTo', as: 'quotations' });
  User.hasMany(ApiKey, { foreignKey: 'userId', as: 'apiKeys' });
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

  // Client associations
  Client.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });
  Client.hasMany(Followup, { foreignKey: 'clientId', as: 'followups' });
  Client.hasMany(Quotation, { foreignKey: 'clientId', as: 'quotations' });

  // Lead associations
  Lead.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });
  Lead.hasMany(Followup, { foreignKey: 'leadId', as: 'followups' });

  // Followup associations
  Followup.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });
  Followup.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  Followup.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

  // Quotation associations
  Quotation.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });
  Quotation.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

  // ApiKey associations
  ApiKey.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Role associations
  Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Subscription associations
  Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });
};

// Define associations
defineAssociations();

const db = {
  sequelize,
  Sequelize: require('sequelize'),
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

module.exports = db;
