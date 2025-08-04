
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// GET resumen completo
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      message: "Ruta de resumen funcionando",
      data: { 
        totalClients: 0,
        totalLeads: 0,
        totalQuotations: 0 
      }
    });
  } catch (error) {
    console.error('Error en resumen:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET PDF resumen
router.get('/pdf', auth, async (req, res) => {
  try {
    res.json({ message: "PDF endpoint funcionando" });
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ message: 'Error generando PDF' });
  }
});

module.exports = router;
