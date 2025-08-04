
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// GET automations
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      message: "Automation funcionando",
      automations: []
    });
  } catch (error) {
    console.error('Error en automation:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
