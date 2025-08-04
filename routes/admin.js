
const express = require('express');
const { User, Role } = require('../models');
const auth = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/permissions');
const bcrypt = require('bcryptjs');

const router = express.Router();

// GET all users - Solo admins
router.get('/users', auth, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Role,
        as: 'Role',
        attributes: ['id', 'name', 'displayName']
      }],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// POST create user - Solo admins
router.post('/users', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, roleId, isActive = true } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
    }

    // Verificar que el email no exista
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Verificar que el rol existe si se proporciona
    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Rol no válido' });
      }
    }

    const user = await User.create({
      name,
      email,
      password, // Se encripta automáticamente en el hook
      roleId,
      isActive
    });

    // Obtener el usuario con el rol incluido
    const userWithRole = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'Role',
        attributes: ['id', 'name', 'displayName']
      }],
      attributes: { exclude: ['password'] }
    });

    res.status(201).json({ 
      message: 'Usuario creado correctamente', 
      user: userWithRole 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// PUT update user - Solo admins
router.put('/users/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, roleId, isActive } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar email único si se está cambiando
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está en uso' });
      }
    }

    // Verificar que el rol existe si se proporciona
    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Rol no válido' });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      roleId: roleId !== undefined ? roleId : user.roleId,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    // Obtener el usuario actualizado con el rol
    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'Role',
        attributes: ['id', 'name', 'displayName']
      }],
      attributes: { exclude: ['password'] }
    });

    res.json({ 
      message: 'Usuario actualizado correctamente', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// DELETE user - Solo admins
router.delete('/users/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // No permitir eliminar el usuario admin principal
    if (user.email === 'admin@admin.com') {
      return res.status(400).json({ message: 'No se puede eliminar el usuario administrador principal' });
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// PUT reset password - Solo admins
router.put('/users/:id/reset-password', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// GET system stats - Solo admins
router.get('/stats', auth, checkRole(['admin']), async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalRoles] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      Role.count()
    ]);

    // Estadísticas por rol
    const usersByRole = await User.findAll({
      include: [{
        model: Role,
        as: 'Role',
        attributes: ['name', 'displayName']
      }],
      attributes: ['roleId'],
      raw: true
    });

    const roleStats = usersByRole.reduce((acc, user) => {
      const roleName = user['Role.name'] || 'Sin rol';
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalRoles,
      usersByRole: roleStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
