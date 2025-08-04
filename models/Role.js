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

  Role.associate = (models) => {
    // Un rol puede tener muchos usuarios
    Role.hasMany(models.User, { 
      foreignKey: 'roleId', 
      as: 'Users' 
    });
  };

  return Role;
};
