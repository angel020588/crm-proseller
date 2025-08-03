
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Automatizaciones() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'lead_created',
    conditions: [],
    actions: [],
    active: true,
    delay: 0
  });

  const token = localStorage.getItem('token');

  const triggerOptions = [
    { value: 'lead_created', label: 'Nuevo lead creado', icon: '🎯' },
    { value: 'client_created', label: 'Nuevo cliente creado', icon: '👥' },
    { value: 'quotation_sent', label: 'Cotización enviada', icon: '📤' },
    { value: 'quotation_approved', label: 'Cotización aprobada', icon: '✅' },
    { value: 'followup_due', label: 'Seguimiento vencido', icon: '⏰' },
    { value: 'lead_no_contact', label: 'Lead sin contactar (7 días)', icon: '📞' },
    { value: 'inactive_client', label: 'Cliente inactivo (30 días)', icon: '😴' }
  ];

  const actionOptions = [
    { value: 'send_email', label: 'Enviar email', icon: '📧', fields: ['template', 'recipient'] },
    { value: 'create_task', label: 'Crear tarea', icon: '✔️', fields: ['task_title', 'description', 'assignee'] },
    { value: 'send_sms', label: 'Enviar SMS', icon: '📱', fields: ['message', 'phone'] },
    { value: 'update_status', label: 'Actualizar estado', icon: '🔄', fields: ['entity', 'status'] },
    { value: 'create_followup', label: 'Crear seguimiento', icon: '📞', fields: ['followup_type', 'date', 'note'] },
    { value: 'assign_tag', label: 'Asignar etiqueta', icon: '🏷️', fields: ['tag_name'] },
    { value: 'webhook', label: 'Llamar webhook', icon: '🔗', fields: ['url', 'method'] }
  ];

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const res = await axios.get('/api/automation', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomations(res.data);
    } catch (err) {
      setError('Error al cargar automatizaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAutomation) {
        await axios.put(`/api/automation/${editingAutomation.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/automation', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      resetForm();
      fetchAutomations();
    } catch (err) {
      setError('Error al guardar automatización');
    }
  };

  const toggleAutomation = async (automationId, currentStatus) => {
    try {
      await axios.put(`/api/automation/${automationId}/toggle`, 
        { active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAutomations();
    } catch (err) {
      setError('Error al cambiar estado de automatización');
    }
  };

  const deleteAutomation = async (automationId) => {
    if (!window.confirm('¿Eliminar esta automatización?')) return;
    try {
      await axios.delete(`/api/automation/${automationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAutomations();
    } catch (err) {
      setError('Error al eliminar automatización');
    }
  };

  const editAutomation = (automation) => {
    setFormData({
      name: automation.name,
      description: automation.description,
      trigger: automation.trigger,
      conditions: automation.conditions || [],
      actions: automation.actions || [],
      active: automation.active,
      delay: automation.delay || 0
    });
    setEditingAutomation(automation);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger: 'lead_created',
      conditions: [],
      actions: [],
      active: true,
      delay: 0
    });
    setEditingAutomation(null);
    setShowModal(false);
  };

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { type: 'send_email', config: {} }]
    });
  };

  const updateAction = (index, field, value) => {
    const updatedActions = formData.actions.map((action, i) => {
      if (i === index) {
        if (field === 'type') {
          return { type: value, config: {} };
        } else {
          return { ...action, config: { ...action.config, [field]: value } };
        }
      }
      return action;
    });
    setFormData({ ...formData, actions: updatedActions });
  };

  const removeAction = (index) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index)
    });
  };

  const filteredAutomations = activeTab === 'active' 
    ? automations.filter(a => a.active)
    : activeTab === 'inactive'
    ? automations.filter(a => !a.active)
    : automations;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando automatizaciones...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-r from-slate-50 to-green-100 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">🤖 Automatizaciones</h1>
          <p className="text-gray-600 mt-1">Workflows automáticos para optimizar tu CRM</p>
        </div>
        <Link
          to="/"
          className="text-green-600 hover:underline font-medium text-sm"
        >
          Volver al Panel Principal
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs y Botón Nuevo */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ✅ Activas ({automations.filter(a => a.active).length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'inactive'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⏸️ Inactivas ({automations.filter(a => !a.active).length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 Todas ({automations.length})
          </button>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors"
        >
          ➕ Nueva Automatización
        </button>
      </div>

      {/* Lista de Automatizaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAutomations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-gray-600">No hay automatizaciones para mostrar</p>
          </div>
        ) : (
          filteredAutomations.map((automation) => (
            <div key={automation.id} className="bg-white p-6 rounded-xl shadow-md border border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-green-900">{automation.name}</h3>
                  <p className="text-sm text-gray-600">{automation.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAutomation(automation.id, automation.active)}
                    className={`px-2 py-1 text-xs rounded-full ${
                      automation.active 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {automation.active ? 'Activa' : 'Inactiva'}
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Disparador:</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-lg">
                      {triggerOptions.find(t => t.value === automation.trigger)?.icon}
                    </span>
                    <span className="text-sm">
                      {triggerOptions.find(t => t.value === automation.trigger)?.label}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Acciones ({automation.actions?.length || 0}):</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {automation.actions?.map((action, index) => {
                      const actionConfig = actionOptions.find(a => a.value === action.type);
                      return (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center space-x-1">
                          <span>{actionConfig?.icon}</span>
                          <span>{actionConfig?.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {automation.delay > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Retraso:</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {automation.delay} {automation.delay === 1 ? 'minuto' : 'minutos'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Ejecutada {automation.executions || 0} veces
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => editAutomation(automation)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => deleteAutomation(automation.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingAutomation ? '✏️ Editar Automatización' : '➕ Nueva Automatización'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre de la automatización"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="border border-green-300 p-3 rounded-lg focus:border-green-500 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Retraso en minutos (0 = inmediato)"
                  value={formData.delay}
                  onChange={(e) => setFormData({...formData, delay: parseInt(e.target.value) || 0})}
                  className="border border-green-300 p-3 rounded-lg focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <textarea
                placeholder="Descripción de la automatización"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="2"
                className="w-full border border-green-300 p-3 rounded-lg focus:border-green-500 focus:ring-green-500"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disparador:</label>
                <select
                  value={formData.trigger}
                  onChange={(e) => setFormData({...formData, trigger: e.target.value})}
                  className="w-full border border-green-300 p-3 rounded-lg focus:border-green-500 focus:ring-green-500"
                >
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Acciones:</label>
                  <button
                    type="button"
                    onClick={addAction}
                    className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-sm"
                  >
                    ➕ Agregar Acción
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.actions.map((action, index) => (
                    <div key={index} className="border border-gray-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <select
                          value={action.type}
                          onChange={(e) => updateAction(index, 'type', e.target.value)}
                          className="border border-gray-300 p-2 rounded"
                        >
                          {actionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeAction(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      {/* Campos específicos por tipo de acción */}
                      {action.type === 'send_email' && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Plantilla de email"
                            value={action.config.template || ''}
                            onChange={(e) => updateAction(index, 'template', e.target.value)}
                            className="border border-gray-300 p-2 rounded text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Destinatario"
                            value={action.config.recipient || ''}
                            onChange={(e) => updateAction(index, 'recipient', e.target.value)}
                            className="border border-gray-300 p-2 rounded text-sm"
                          />
                        </div>
                      )}
                      
                      {action.type === 'create_task' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Título de la tarea"
                            value={action.config.task_title || ''}
                            onChange={(e) => updateAction(index, 'task_title', e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded text-sm"
                          />
                          <textarea
                            placeholder="Descripción"
                            value={action.config.description || ''}
                            onChange={(e) => updateAction(index, 'description', e.target.value)}
                            rows="2"
                            className="w-full border border-gray-300 p-2 rounded text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span>Automatización activa</span>
              </label>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  {editingAutomation ? 'Actualizar' : 'Crear'} Automatización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
