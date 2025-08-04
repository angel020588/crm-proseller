const { Role } = require("../models");

async function seedRoles() {
  const roles = ["admin", "usuario", "editor", "supervisor"];

  for (const roleName of roles) {
    const [role, created] = await Role.findOrCreate({
      where: { name: roleName },
      defaults: { name: roleName },
    });

    if (created) {
      console.log(`🔧 Rol creado: ${roleName}`);
    } else {
      console.log(`✅ Rol existente: ${roleName}`);
    }
  }
}

module.exports = seedRoles;
