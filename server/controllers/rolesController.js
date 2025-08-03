
const { Role } = require("../models");

exports.createRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({ 
        error: "El nombre y nombre de visualización del rol son obligatorios" 
      });
    }

    // Verificar si ya existe un rol con ese nombre
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ 
        error: "Ya existe un rol con ese nombre" 
      });
    }

    // Crear el nuevo rol
    const newRole = await Role.create({
      name,
      displayName,
      description: description || "",
      permissions: permissions || {},
      isActive: true
    });

    res.status(201).json({
      message: "Rol creado correctamente",
      role: newRole,
    });
  } catch (error) {
    console.error("❌ Error al crear rol:", error);
    res.status(500).json({
      error: "Error al crear el rol",
      details: error.message,
    });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    res.json(roles);
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    res.status(500).json({
      error: "Error al obtener roles",
      details: error.message,
    });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, description, permissions } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    // No permitir editar roles del sistema
    if (['owner', 'admin'].includes(role.name)) {
      return res.status(403).json({ 
        error: "No se puede editar este rol del sistema" 
      });
    }

    await role.update({
      displayName: displayName || role.displayName,
      description: description || role.description,
      permissions: permissions || role.permissions
    });

    res.json({
      message: "Rol actualizado correctamente",
      role
    });
  } catch (error) {
    console.error("❌ Error al actualizar rol:", error);
    res.status(500).json({
      error: "Error al actualizar el rol",
      details: error.message,
    });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    // No permitir eliminar roles del sistema
    if (['owner', 'admin', 'manager', 'sales', 'viewer'].includes(role.name)) {
      return res.status(403).json({ 
        error: "No se puede eliminar este rol del sistema" 
      });
    }

    // Verificar si hay usuarios usando este rol
    const { User } = require("../models");
    const usersWithRole = await User.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar el rol. ${usersWithRole} usuario(s) lo están usando.` 
      });
    }

    await role.update({ isActive: false });
    
    res.json({ message: "Rol eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar rol:", error);
    res.status(500).json({
      error: "Error al eliminar el rol",
      details: error.message,
    });
  }
};
