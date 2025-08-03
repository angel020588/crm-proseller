const express = require('express');
const router = express.Router();
const Followup = require('../models/Followup');
const auth = require('../middleware/auth');

// Get all followups for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const followups = await Followup.findAll({
      where: { assignedTo: req.user.id },
      order: [['dueDate', 'ASC']]
    });
    res.json(followups);
  } catch (error) {
    console.error('Error getting followups:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Create new followup
router.post('/', auth, async (req, res) => {
  try {
    const followupData = {
      ...req.body,
      assignedTo: req.user.id,
    };

    const followup = await Followup.create(followupData);
    res.status(201).json(followup);
  } catch (error) {
    console.error('Error creating followup:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Update followup
router.put('/:id', auth, async (req, res) => {
  try {
    const [updated] = await Followup.update(req.body, {
      where: { id: req.params.id, assignedTo: req.user.id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Seguimiento no encontrado' });
    }

    const followup = await Followup.findByPk(req.params.id);
    res.json({ message: 'Seguimiento actualizado exitosamente', followup });
  } catch (error) {
    console.error('Error updating followup:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Delete followup
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Followup.destroy({
      where: { id: req.params.id, assignedTo: req.user.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Seguimiento no encontrado' });
    }

    res.json({ message: 'Seguimiento eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting followup:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;