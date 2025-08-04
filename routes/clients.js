
const express = require('express');
const { Client } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET all clients
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// POST new client
router.post('/', auth, async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
