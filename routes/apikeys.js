
const express = require('express');
const { ApiKey } = require('../models');
const auth = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// GET all API keys
router.get('/', auth, async (req, res) => {
  try {
    const apiKeys = await ApiKey.findAll({
      where: { userId: req.user.id },
      attributes: { exclude: ['keyHash'] }
    });
    res.json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// POST new API key
router.post('/', auth, async (req, res) => {
  try {
    const key = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    
    const apiKey = await ApiKey.create({
      name: req.body.name || 'API Key',
      keyHash,
      userId: req.user.id
    });

    res.status(201).json({ ...apiKey.toJSON(), key });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
