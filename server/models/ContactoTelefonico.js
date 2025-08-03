// server/models/ContactoTelefonico.js
module.exports = (sequelize, DataTypes) => {
  const ContactoTelefonico = sequelize.define('ContactoTelefonico', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true }
    },
    codigo_postal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'contactos_telefonicos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ContactoTelefonico;
};