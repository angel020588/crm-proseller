
// server/models/Followup.js
module.exports = (sequelize, DataTypes) => {
  const Followup = sequelize.define('Followup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.ENUM('llamada', 'email', 'whatsapp', 'reunion', 'cotizacion', 'otro'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pendiente', 'completado', 'cancelado'),
      defaultValue: 'pendiente'
    },
    priority: {
      type: DataTypes.ENUM('baja', 'media', 'alta'),
      defaultValue: 'media'
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'leads',
        key: 'id'
      }
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'followups',
    timestamps: true
  });

  Followup.associate = (models) => {
    Followup.belongsTo(models.User, { foreignKey: 'assignedTo' });
    Followup.belongsTo(models.Client, { foreignKey: 'clientId' });
    Followup.belongsTo(models.Lead, { foreignKey: 'leadId' });
  };

  return Followup;
};
