
const express = require('express');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Followup = require('../models/Followup');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware para verificar rol de admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// Obtener estadísticas generales
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const totalLeads = await Lead.count();
    const totalClients = await Client.count();
    const pendingFollowups = await Followup.count({ where: { status: 'pendiente' } });
    
    const stats = {
      totalUsers,
      activeUsers,
      totalLeads,
      totalClients,
      pendingFollowups,
      conversionRate: totalLeads > 0 ? ((totalClients / totalLeads) * 100).toFixed(2) : 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener todos los usuarios
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Actualizar usuario
router.put('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { isActive, role } = req.body;
    
    const [updated] = await User.update(
      { isActive, role },
      { where: { id: req.params.id } }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({ message: 'Usuario actualizado', user });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Eliminar usuario
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
