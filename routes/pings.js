
const express = require('express');
const router = express.Router();

// GET ping endpoint - Simple health check
router.get('/', (req, res) => {
  try {
    res.json({ 
      status: 'success',
      message: '🚀 API funcionando correctamente',
      timestamp: new Date().toISOString(),
      server: 'CRM ProSeller',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error', 
      message: 'Error en el servidor',
      error: error.message
    });
  }
});

// POST ping endpoint 
router.post('/', (req, res) => {
  res.json({
    status: 'success',
    message: '✅ POST ping funcionando',
    received: req.body,
    timestamp: new Date()
  });
});

module.exports = router;
