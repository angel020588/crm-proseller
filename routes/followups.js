
const express = require('express');
const { Followup } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET all followups
router.get('/', auth, async (req, res) => {
  try {
    const followups = await Followup.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(followups);
  } catch (error) {
    console.error('Error fetching followups:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// POST new followup
router.post('/', auth, async (req, res) => {
  try {
    const followup = await Followup.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(followup);
  } catch (error) {
    console.error('Error creating followup:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
