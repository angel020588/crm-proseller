const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabaseClient");

router.post('/', async (req, res) => {
  const { nombre, telefono, email, ciudad } = req.body;

  // Validar campos requeridos
  if (!nombre || !telefono || !email || !ciudad) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  console.log('📩 Recibido:', req.body); // Para saber si llega la data

  const { data, error } = await supabase
    .from('CLIENTE')
    .insert([{ nombre, telefono, email, ciudad }]);

  if (error) {
    console.error('❌ Error Supabase:', error.message);
    return res.status(500).json({ error: error.message });
  }

  console.log('✅ Insertado en Supabase:', data); // Para ver si se guardó
  res.status(201).json({ message: '✅ Cliente registrado', data });
});

module.exports = router;
