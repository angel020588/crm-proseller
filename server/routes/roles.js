
// server/routes/roles.js
const express = require('express');
const router = express.Router();

// 👇 IMPORTA BIEN EL MODELO DESDE models/index.js  
const db = require('../models');
const Role = db.Role;
const User = db.User;

const { authMiddleware } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// 🚀 GET: obtener todos los roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.json(roles);
  } catch (error) {
    console.error('❌ Error al obtener roles:', error.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear nuevo rol
router.post('/', authMiddleware, checkPermission('admin', 'write'), async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;
    
    const role = await Role.create({
      name,
      displayName,
      description,
      permissions
    });
    
    res.status(201).json(role);
  } catch (error) {
    console.error('❌ Error creando rol:', error.message);
    res.status(500).json({ message: 'Error creando rol' });
  }
});

// Actualizar rol
router.put('/:id', authMiddleware, checkPermission('admin', 'write'), async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, description, permissions } = req.body;
    
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    // No permitir editar roles del sistema
    if (['owner', 'admin'].includes(role.name)) {
      return res.status(403).json({ message: 'No se puede editar este rol del sistema' });
    }
    
    await role.update({
      displayName,
      description,
      permissions
    });
    
    res.json(role);
  } catch (error) {
    console.error('❌ Error actualizando rol:', error.message);
    res.status(500).json({ message: 'Error actualizando rol' });
  }
});

// Asignar rol a usuario
router.post('/assign', authMiddleware, checkPermission('admin', 'write'), async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);
    
    if (!user || !role) {
      return res.status(404).json({ message: 'Usuario o rol no encontrado' });
    }
    
    await user.update({
      roleId: roleId,
      role: role.name
    });
    
    res.json({ message: 'Rol asignado correctamente', user, role });
  } catch (error) {
    console.error('❌ Error asignando rol:', error.message);
    res.status(500).json({ message: 'Error asignando rol' });
  }
});

// Obtener permisos de un usuario
router.get('/permissions/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Solo el mismo usuario o admin pueden ver permisos
    if (req.user.id !== parseInt(userId) && req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const role = await Role.findOne({ where: { name: user.role } });
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      permissions: role ? role.permissions : {},
      roleInfo: role ? {
        displayName: role.displayName,
        description: role.description
      } : null
    });
  } catch (error) {
    console.error('❌ Error obteniendo permisos:', error.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
