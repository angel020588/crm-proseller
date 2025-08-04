
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../lib/supabaseClient');

// Definir campos personalizados para leads
router.post('/lead-fields', auth, async (req, res) => {
  try {
    const { fields } = req.body;
    const userId = req.user.id;
    
    // Guardar configuración de campos personalizados
    const { data, error } = await supabase
      .from('custom_field_configs')
      .upsert({
        user_id: userId,
        entity_type: 'lead',
        fields_config: fields,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Campos personalizados configurados',
      fields
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener campos personalizados
router.get('/lead-fields', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('custom_field_configs')
      .select('fields_config')
      .eq('user_id', userId)
      .eq('entity_type', 'lead')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    const defaultFields = [
      {
        id: 'budget',
        name: 'Presupuesto',
        type: 'number',
        required: false,
        options: null
      },
      {
        id: 'timeline',
        name: 'Cronograma',
        type: 'select',
        required: false,
        options: ['Inmediato', '1-3 meses', '3-6 meses', '6+ meses']
      },
      {
        id: 'company_size',
        name: 'Tamaño de Empresa',
        type: 'select',
        required: false,
        options: ['1-10', '11-50', '51-200', '200+']
      }
    ];
    
    res.json({
      fields: data?.fields_config || defaultFields
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Guardar valores de campos personalizados
router.post('/lead-values/:leadId', auth, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { customValues } = req.body;
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('custom_field_values')
      .upsert({
        user_id: userId,
        entity_type: 'lead',
        entity_id: leadId,
        field_values: customValues,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Valores guardados exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener valores de campos personalizados
router.get('/lead-values/:leadId', auth, async (req, res) => {
  try {
    const { leadId } = req.params;
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('custom_field_values')
      .select('field_values')
      .eq('user_id', userId)
      .eq('entity_type', 'lead')
      .eq('entity_id', leadId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    res.json({
      values: data?.field_values || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Templates de campos por industria
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = {
      'inmobiliario': [
        { id: 'property_type', name: 'Tipo de Propiedad', type: 'select', options: ['Casa', 'Departamento', 'Oficina', 'Local'] },
        { id: 'budget_min', name: 'Presupuesto Mínimo', type: 'number' },
        { id: 'budget_max', name: 'Presupuesto Máximo', type: 'number' },
        { id: 'location_preference', name: 'Zona Preferida', type: 'text' },
        { id: 'urgency', name: 'Urgencia', type: 'select', options: ['Inmediato', '1-3 meses', '3-6 meses', 'Explorando'] }
      ],
      'seguros': [
        { id: 'insurance_type', name: 'Tipo de Seguro', type: 'select', options: ['Auto', 'Vida', 'Gastos Médicos', 'Hogar'] },
        { id: 'current_provider', name: 'Aseguradora Actual', type: 'text' },
        { id: 'coverage_amount', name: 'Suma Asegurada', type: 'number' },
        { id: 'family_members', name: 'Miembros de Familia', type: 'number' },
        { id: 'renewal_date', name: 'Fecha de Renovación', type: 'date' }
      ],
      'tecnologia': [
        { id: 'company_size', name: 'Tamaño de Empresa', type: 'select', options: ['1-10', '11-50', '51-200', '200+'] },
        { id: 'current_solution', name: 'Solución Actual', type: 'text' },
        { id: 'implementation_timeline', name: 'Cronograma', type: 'select', options: ['Inmediato', '1-3 meses', '3-6 meses'] },
        { id: 'decision_makers', name: 'Tomadores de Decisión', type: 'text' },
        { id: 'budget_range', name: 'Rango de Presupuesto', type: 'select', options: ['< $10k', '$10k-50k', '$50k-100k', '$100k+'] }
      ]
    };
    
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
