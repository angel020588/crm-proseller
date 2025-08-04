async function seedRoles(db) {
  const roles = ["admin", "usuario", "editor", "supervisor"];
  const Role = db.Role;

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
