
const express = require('express');
const { Lead } = require('../models');
const { Op } = require('sequelize');
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

// GET single lead by ID
router.get('/:id', auth, async (req, res) => {
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
    console.error('Error fetching lead:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// PUT update lead
router.put('/:id', auth, async (req, res) => {
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
    
    await lead.update(req.body);
    res.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// DELETE lead
router.delete('/:id', auth, async (req, res) => {
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
    
    await lead.destroy();
    res.json({ message: 'Lead eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// GET leads by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const { status } = req.params;
    const leads = await Lead.findAll({
      where: { 
        userId: req.user.id,
        status: status
      },
      order: [['createdAt', 'DESC']]
    });
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads by status:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// GET leads with search and filters
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const leads = await Lead.findAll({
      where: {
        userId: req.user.id,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { company: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    res.json(leads);
  } catch (error) {
    console.error('Error searching leads:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
