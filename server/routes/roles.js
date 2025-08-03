const express = require('express');
const router = express.Router();

// Importar controladores
const { 
  createRole, 
  getAllRoles, 
  updateRole, 
  deleteRole 
} = require('../controllers/rolesController');

// Importar modelos desde models/index.js  
const db = require('../models');
const Role = db.Role;
const User = db.User;

const { authMiddleware } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// GET: obtener todos los roles
router.get('/', getAllRoles);

// POST: Crear nuevo rol
router.post('/', authMiddleware, checkPermission('admin', 'write'), createRole);

// POST: Ruta alternativa para crear rol
router.post('/crear', authMiddleware, checkPermission('admin', 'write'), createRole);

// PUT: Actualizar rol
router.put('/:id', authMiddleware, checkPermission('admin', 'write'), updateRole);

// DELETE: Eliminar rol (desactivar)
router.delete('/:id', authMiddleware, checkPermission('admin', 'delete'), deleteRole);

// POST: Asignar rol a usuario
router.post('/assign', authMiddleware, checkPermission('admin', 'write'), async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ message: 'userId y roleId son requeridos' });
    }

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

// GET: Obtener permisos de un usuario
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