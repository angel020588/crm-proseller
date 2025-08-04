
const express = require('express');
const { User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
