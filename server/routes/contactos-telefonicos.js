const express = require('express');
const router = express.Router();
const ContactoTelefonico = require('../models/ContactoTelefonico');
const auth = require('../middleware/auth');
const supabase = require('../lib/supabaseClient');

// Obtener todos los contactos telefónicos
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, codigo_postal, estado } = req.query;

    let query = supabase.from('contactos_telefonicos').select('*');

    // Aplicar filtros
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,telefono.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (codigo_postal) {
      query = query.eq('codigo_postal', codigo_postal);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    // Paginación
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: contactos, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      contactos,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error obteniendo contactos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo contacto telefónico
router.post('/', auth, async (req, res) => {
  try {
    const { nombre, telefono, email, codigo_postal, notas_internas } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({ error: 'Nombre y teléfono son requeridos' });
    }

    const { data, error } = await supabase
      .from('contactos_telefonicos')
      .insert([{
        nombre,
        telefono,
        email,
        codigo_postal,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Contacto telefónico creado exitosamente',
      data
    });
  } catch (error) {
    console.error('Error creando contacto telefónico:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener contacto por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: contacto, error } = await supabase
      .from('contactos_telefonicos')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    res.json({ success: true, contacto });
  } catch (error) {
    console.error('Error obteniendo contacto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar contacto
router.put('/:id', auth, async (req, res) => {
  try {
    const { data: contacto, error } = await supabase
      .from('contactos_telefonicos')
      .update({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    res.json({
      success: true,
      message: 'Contacto actualizado exitosamente',
      contacto
    });
  } catch (error) {
    console.error('Error actualizando contacto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Registrar intento de contacto
router.post('/:id/contactar', auth, async (req, res) => {
  try {
    const { data: contacto, error } = await supabase
      .from('contactos_telefonicos')
      .update({
        ultimo_contacto: new Date().toISOString(),
        intentos_contacto: supabase.raw('intentos_contacto + 1'),
        estado: 'contactado',
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    res.json({
      success: true,
      message: 'Contacto registrado exitosamente',
      contacto
    });
  } catch (error) {
    console.error('Error registrando contacto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar contacto
router.delete('/:id', auth, async (req, res) => {
  try {
    const { data: contacto, error } = await supabase
      .from('contactos_telefonicos')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    res.json({
      success: true,
      message: 'Contacto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando contacto:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;