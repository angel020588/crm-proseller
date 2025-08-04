module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define("Role", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    displayName: DataTypes.STRING,
    description: DataTypes.TEXT,
    permissions: DataTypes.JSONB,
  });

  // Puedes agregar asociaciones si lo necesitas:
  // Role.associate = (db) => {};

  return Role;
};
