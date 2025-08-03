const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const { Lead } = require('../models');

// Obtener todos los leads del usuario
router.get('/', verifyToken, async (req, res) => {
  try {
    const leads = await Lead.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']]
    });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener un lead específico
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const lead = await Lead.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead no encontrado' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Crear nuevo lead
router.post('/', verifyToken, async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      userId: req.user.id,
    };

    const lead = await Lead.create(leadData);

    res.status(201).json({ message: 'Lead creado exitosamente', lead });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Actualizar lead
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const [updated] = await Lead.update(req.body, {
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Lead no encontrado' });
    }

    const lead = await Lead.findByPk(req.params.id);
    res.json({ message: 'Lead actualizado', lead });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Eliminar lead
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Lead.destroy({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Lead no encontrado' });
    }

    res.json({ message: 'Lead eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Cambiar status de lead
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    const lead = await Lead.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead no encontrado' });
    }

    await lead.update({ status });
    res.json({ message: 'Status actualizado', lead });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;