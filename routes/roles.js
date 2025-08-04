
const express = require('express');
const { Role, User } = require('../models');
const auth = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/permissions');

const router = express.Router();

// GET all roles - Solo admins
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{
        model: User,
        as: 'Users',
        attributes: ['id', 'name', 'email']
      }]
    });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// POST new role - Solo admins
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Nombre del rol es requerido' });
    }

    // Verificar que el rol no exista
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ message: 'El rol ya existe' });
    }

    const role = await Role.create({
      name,
      displayName: displayName || name,
      description,
      permissions: permissions || []
    });

    res.status(201).json({ message: 'Rol creado correctamente', role });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// PUT update role - Solo admins
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { displayName, description, permissions } = req.body;
    
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    await role.update({
      displayName: displayName || role.displayName,
      description: description || role.description,
      permissions: permissions || role.permissions
    });

    res.json({ message: 'Rol actualizado correctamente', role });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// DELETE role - Solo admins
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // No permitir eliminar rol admin
    if (role.name === 'admin') {
      return res.status(400).json({ message: 'No se puede eliminar el rol de administrador' });
    }

    // Verificar si hay usuarios con este rol
    const usersCount = await User.count({ where: { roleId: role.id } });
    if (usersCount > 0) {
      return res.status(400).json({ 
        message: `No se puede eliminar el rol. ${usersCount} usuarios lo tienen asignado` 
      });
    }

    await role.destroy();
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// GET available permissions - Solo admins
router.get('/permissions', auth, checkRole(['admin']), async (req, res) => {
  try {
    // Lista de permisos disponibles en el sistema
    const availablePermissions = [
      { id: 'read_users', name: 'Ver usuarios', category: 'Usuarios' },
      { id: 'write_users', name: 'Gestionar usuarios', category: 'Usuarios' },
      { id: 'read_clients', name: 'Ver clientes', category: 'Clientes' },
      { id: 'write_clients', name: 'Gestionar clientes', category: 'Clientes' },
      { id: 'read_leads', name: 'Ver leads', category: 'Leads' },
      { id: 'write_leads', name: 'Gestionar leads', category: 'Leads' },
      { id: 'read_quotations', name: 'Ver cotizaciones', category: 'Cotizaciones' },
      { id: 'write_quotations', name: 'Gestionar cotizaciones', category: 'Cotizaciones' },
      { id: 'read_analytics', name: 'Ver analíticas', category: 'Reportes' },
      { id: 'write_analytics', name: 'Gestionar analíticas', category: 'Reportes' },
      { id: 'admin_panel', name: 'Acceso total', category: 'Administración' },
      { id: 'manage_roles', name: 'Gestionar roles', category: 'Administración' },
      { id: 'manage_subscriptions', name: 'Gestionar suscripciones', category: 'Facturación' }
    ];

    res.json(availablePermissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// POST assign role to user - Solo admins
router.post('/assign', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({ message: 'userId y roleId son requeridos' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    await user.update({ roleId });
    
    res.json({ 
      message: `Rol ${role.name} asignado a ${user.name} correctamente`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: role.id,
        roleName: role.name
      }
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
