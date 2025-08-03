

// server/models/Quotation.js
module.exports = (sequelize, DataTypes) => {
  const Quotation = sequelize.define('Quotation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('borrador', 'enviada', 'aceptada', 'rechazada'),
      defaultValue: 'borrador'
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    items: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    tableName: 'quotations',
    timestamps: true
  });

  Quotation.associate = (models) => {
    Quotation.belongsTo(models.User, { foreignKey: 'userId' });
    Quotation.belongsTo(models.Client, { foreignKey: 'clientId' });
    Quotation.belongsTo(models.Lead, { foreignKey: 'leadId' });
  };

  return Quotation;
};
