
const express = require('express');
const { Lead } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET all leads
router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// POST new lead
router.post('/', auth, async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
