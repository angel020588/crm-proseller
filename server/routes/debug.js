
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabaseClient');

// Ruta temporal para ver todas las tablas
router.get('/tables', async (req, res) => {
  try {
    const { data: leads } = await supabase.from('leads').select('*');
    const { data: clients } = await supabase.from('clients').select('*');
    const { data: followups } = await supabase.from('followups').select('*');
    const { data: contactos } = await supabase.from('contactos_telefonicos').select('*');

    res.json({
      leads: leads || [],
      clients: clients || [],
      followups: followups || [],
      contactos_telefonicos: contactos || [],
      total_leads: leads?.length || 0,
      total_clients: clients?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
