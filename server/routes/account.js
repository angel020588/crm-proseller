const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const { User, Role } = require('../models');

// Actualizar perfil
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validaciones básicas
    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y email son requeridos' });
    }

    // Verificar si el email ya existe (excluyendo el usuario actual)
    const existingUser = await User.findOne({ 
      where: { 
        email,
        id: { [require('sequelize').Op.ne]: req.user.id }
      } 
    });

    if (existingUser) {
      return res.status(409).json({ message: 'El correo ya está en uso por otro usuario' });
    }

    // Actualizar usuario
    await User.update(
      { name, email },
      { where: { id: req.user.id } }
    );

    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Cambiar contraseña
router.put('/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validaciones básicas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Contraseña actual y nueva son requeridas' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Obtener usuario actual
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await User.update(
      { password: hashedPassword },
      { where: { id: req.user.id } }
    );

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener información de la cuenta
router.get('/info', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'Role' }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role?.name || 'vendedor',
        roleDisplayName: user.Role?.displayName || 'Vendedor',
        permissions: user.Role?.permissions || {},
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;