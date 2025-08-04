
const express = require('express');
const { Subscription } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET user subscription
router.get('/', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    });
    res.json(subscription || { plan: 'free', status: 'active' });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
