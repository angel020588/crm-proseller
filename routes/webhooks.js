
const express = require('express');
const router = express.Router();

// POST webhook endpoint
router.post('/', async (req, res) => {
  try {
    console.log('Webhook received:', req.body);
    res.json({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
