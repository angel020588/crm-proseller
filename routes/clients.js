
const express = require('express');
const { Client } = require('../models');
const { Op } = require('sequelize');
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
      assignedTo: req.user.id
    });
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// GET single client by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { 
        id: req.params.id,
        assignedTo: req.user.id 
      }
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// PUT update client
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { 
        id: req.params.id,
        assignedTo: req.user.id 
      }
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    await client.update(req.body);
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// DELETE client
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { 
        id: req.params.id,
        assignedTo: req.user.id 
      }
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    await client.destroy();
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// GET clients with search and filters
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const clients = await Client.findAll({
      where: {
        assignedTo: req.user.id,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { company: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    res.json(clients);
  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
