
const { Role, User } = require('../models');

// Obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['createdAt', 'ASC']]
    });
    res.json(roles);
  } catch (error) {
    console.error('❌ Error obteniendo roles:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear nuevo rol
exports.crearRol = async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;
    
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Nombre y nombre de visualización son requeridos' });
    }

    // Verificar si el rol ya existe
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
    }

    const newRole = await Role.create({
      name,
      displayName,
      description: description || '',
      permissions: permissions || {}
    });

    res.status(201).json({
      message: 'Rol creado exitosamente',
      role: newRole
    });
  } catch (error) {
    console.error('❌ Error creando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar rol
exports.actualizarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, description, permissions } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    await role.update({
      displayName: displayName || role.displayName,
      description: description || role.description,
      permissions: permissions || role.permissions
    });

    res.json({
      message: 'Rol actualizado exitosamente',
      role
    });
  } catch (error) {
    console.error('❌ Error actualizando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar rol
exports.eliminarRol = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Verificar si hay usuarios con este rol
    const usersWithRole = await User.count({ where: { role: role.name } });
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el rol porque hay usuarios asignados a él' 
      });
    }

    await role.destroy();
    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener permisos de un rol específico
exports.getPermisos = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    res.json({
      role: {
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description
      },
      permissions: role.permissions || {}
    });
  } catch (error) {
    console.error('❌ Error obteniendo permisos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
