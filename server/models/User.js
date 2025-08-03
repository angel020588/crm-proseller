// server/models/User.js
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    async comparePassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "user", "manager"),
        defaultValue: "user",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      permissions: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    },
  );

  User.associate = (models) => {
    User.hasMany(models.Client, { foreignKey: "assignedTo" });
    User.hasMany(models.Lead, { foreignKey: "userId" });
    User.hasMany(models.Followup, { foreignKey: "assignedTo" });
    User.hasMany(models.Quotation, { foreignKey: "userId" });
    User.hasMany(models.Notification, { foreignKey: "userId" });
    User.hasMany(models.ApiKey, { foreignKey: "userId" });
    User.hasMany(models.Subscription, { foreignKey: "userId" });
  };

  return User;
};
