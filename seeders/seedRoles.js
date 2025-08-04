
async function seedRoles(db) {
  const roles = [
    {
      name: "admin",
      displayName: "Administrador",
      description: "Acceso completo al sistema",
      permissions: {
        dashboard: { read: true, write: true, delete: true },
        leads: { read: true, write: true, delete: true },
        clients: { read: true, write: true, delete: true },
        quotations: { read: true, write: true, delete: true },
        followups: { read: true, write: true, delete: true },
        users: { read: true, write: true, delete: true },
        settings: { read: true, write: true, delete: true },
        apikeys: { read: true, write: true, delete: true },
        admin: { read: true, write: true, delete: true }
      }
    },
    {
      name: "usuario",
      displayName: "Usuario",
      description: "Acceso básico al sistema",
      permissions: {
        dashboard: { read: true, write: false, delete: false },
        leads: { read: true, write: true, delete: false },
        clients: { read: true, write: true, delete: false },
        quotations: { read: true, write: true, delete: false },
        followups: { read: true, write: true, delete: false },
        users: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
        apikeys: { read: false, write: false, delete: false },
        admin: { read: false, write: false, delete: false }
      }
    },
    {
      name: "editor",
      displayName: "Editor",
      description: "Puede editar contenido del sistema",
      permissions: {
        dashboard: { read: true, write: true, delete: false },
        leads: { read: true, write: true, delete: true },
        clients: { read: true, write: true, delete: true },
        quotations: { read: true, write: true, delete: true },
        followups: { read: true, write: true, delete: true },
        users: { read: true, write: false, delete: false },
        settings: { read: true, write: false, delete: false },
        apikeys: { read: true, write: false, delete: false },
        admin: { read: false, write: false, delete: false }
      }
    },
    {
      name: "supervisor",
      displayName: "Supervisor",
      description: "Supervisa operaciones del sistema",
      permissions: {
        dashboard: { read: true, write: true, delete: false },
        leads: { read: true, write: true, delete: true },
        clients: { read: true, write: true, delete: true },
        quotations: { read: true, write: true, delete: true },
        followups: { read: true, write: true, delete: true },
        users: { read: true, write: true, delete: false },
        settings: { read: true, write: true, delete: false },
        apikeys: { read: true, write: true, delete: false },
        admin: { read: false, write: false, delete: false }
      }
    }
  ];

  const Role = db.Role;

  for (const roleData of roles) {
    const [role, created] = await Role.findOrCreate({
      where: { name: roleData.name },
      defaults: roleData
    });

    if (created) {
      console.log(`✅ Rol creado: ${roleData.name}`);
    } else {
      console.log(`ℹ️  Rol ya existe: ${roleData.name}`);
    }
  }
}

module.exports = seedRoles;
