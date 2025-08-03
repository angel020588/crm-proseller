
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const { Notification } = require('../models');

// Obtener todas las notificaciones del usuario
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Marcar notificación como leída
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const [updated] = await Notification.update(
      { isRead: true },
      { 
        where: { 
          id: req.params.id, 
          userId: req.user.id 
        } 
      }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Marcar todas las notificaciones como leídas
router.patch('/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { 
        where: { 
          userId: req.user.id,
          isRead: false
        } 
      }
    );

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Crear nueva notificación (para uso interno del sistema)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;
    
    const notification = await Notification.create({
      title,
      message,
      type,
      userId: req.user.id,
      isRead: false
    });

    res.status(201).json({ message: 'Notificación creada', notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Eliminar notificación
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Notification.destroy({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
