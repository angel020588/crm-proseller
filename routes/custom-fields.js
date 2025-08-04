
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// GET custom fields
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      message: "Custom fields funcionando",
      fields: []
    });
  } catch (error) {
    console.error('Error en custom fields:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
