
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// GET analytics
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      message: "Analytics funcionando",
      data: {
        visits: 0,
        conversions: 0,
        revenue: 0
      }
    });
  } catch (error) {
    console.error('Error en analytics:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
