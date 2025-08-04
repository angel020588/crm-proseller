
const express = require('express');
const { Role } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET all roles
router.get('/', auth, async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
