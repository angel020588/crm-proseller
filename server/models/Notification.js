
// server/models/Notification.js
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    message: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    type: { 
      type: DataTypes.STRING, 
      defaultValue: "info" 
    }, // success, warning, error, info
    read: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'notifications',
    timestamps: true
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Notification;
};
