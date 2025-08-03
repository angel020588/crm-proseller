
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const { User, Role } = require('../models');

// Obtener todos los usuarios (solo admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Verificar que el usuario tenga permisos de admin
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener usuario específico
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Solo el mismo usuario o admin pueden ver los detalles
    if (req.user.id !== parseInt(userId) && req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Actualizar usuario
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role } = req.body;

    // Solo el mismo usuario puede actualizar sus datos básicos, solo admin puede cambiar roles
    if (req.user.id !== parseInt(userId) && req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Solo admin puede cambiar roles
    if (role && req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para cambiar roles' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && (req.user.role === 'owner' || req.user.role === 'admin')) {
      updateData.role = role;
    }

    const [updated] = await User.update(updateData, {
      where: { id: userId }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });

    res.json({ message: 'Usuario actualizado', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Solo admin puede eliminar usuarios
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // No permitir que se elimine a sí mismo
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
    }

    const deleted = await User.destroy({
      where: { id: userId }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
