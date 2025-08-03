
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Automation() {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'new_lead',
    conditions: {},
    actions: [],
    active: true
  });

  useEffect(() => {
    fetchAutomations();
    fetchTemplates();
  }, []);

  const fetchAutomations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/automation/rules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomations([response.data.rules].filter(Boolean));
    } catch (error) {
      console.error('Error fetching automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/automation/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/automation/rules', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAutomations();
      resetForm();
      alert('Automatización creada exitosamente');
    } catch (error) {
      console.error('Error creating automation:', error);
      alert('Error al crear automatización');
    }
  };

  const executeAutomation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/automation/execute', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Automatización ejecutada: ${response.data.processed} elementos procesados`);
    } catch (error) {
      console.error('Error executing automation:', error);
      alert('Error al ejecutar automatización');
    }
  };

  const useTemplate = (template) => {
    setFormData({
      name: template.name,
      trigger: template.triggers[0],
      conditions: template.conditions || {},
      actions: template.actions,
      active: true
    });
    setShowModal(true);
  };

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, {
        type: 'create_followup',
        delayDays: 1,
        notes: '',
        priority: 'media'
      }]
    });
  };

  const updateAction = (index, field, value) => {
    const newActions = [...formData.actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setFormData({ ...formData, actions: newActions });
  };

  const removeAction = (index) => {
    const newActions = formData.actions.filter((_, i) => i !== index);
    setFormData({ ...formData, actions: newActions });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      trigger: 'new_lead',
      conditions: {},
      actions: [],
      active: true
    });
    setShowModal(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando automatizaciones...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1"
              >
                ← Volver al Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">🤖 Automatizaciones</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={executeAutomation}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                ▶️ Ejecutar
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Nueva Automatización
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Automatizaciones Activas
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Templates
              </button>
            </nav>
          </div>

          {/* Contenido de Tabs */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {automations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay automatizaciones activas</h3>
                  <p className="text-gray-500 mb-4">Crea tu primera automatización para optimizar tu flujo de trabajo.</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Crear Automatización
                  </button>
                </div>
              ) : (
                automations.map((automation, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{automation.name || 'Automatización sin nombre'}</h3>
                        <p className="text-sm text-gray-600">
                          Trigger: {automation.triggers?.join(', ')} | 
                          Acciones: {automation.actions?.length || 0}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        automation.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {automation.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Condiciones:</strong> {JSON.stringify(automation.conditions)}</p>
                      <div>
                        <p className="text-sm font-medium">Acciones:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                          {automation.actions?.map((action, i) => (
                            <li key={i}>
                              {action.type === 'create_followup' && `Crear seguimiento (${action.followupType})`}
                              {action.type === 'change_status' && `Cambiar estado a ${action.newStatus}`}
                              {action.type === 'send_notification' && 'Enviar notificación'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <strong>Triggers:</strong> {template.triggers.join(', ')}
                    </div>
                    <div className="text-sm">
                      <strong>Acciones:</strong> {template.actions.length}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFormData({
                        name: template.name,
                        trigger: template.triggers[0],
                        conditions: template.conditions || {},
                        actions: template.actions,
                        active: true
                      });
                      setShowModal(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Usar Template
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Nueva Automatización
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trigger</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.trigger}
                        onChange={(e) => setFormData({...formData, trigger: e.target.value})}
                      >
                        <option value="new_lead">Nuevo Lead</option>
                        <option value="status_change">Cambio de Estado</option>
                        <option value="time_based">Basado en Tiempo</option>
                      </select>
                    </div>
                  </div>

                  {/* Condiciones */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold mb-2">Condiciones</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.conditions.status || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            conditions: {...formData.conditions, status: e.target.value}
                          })}
                        >
                          <option value="">Cualquier estado</option>
                          <option value="nuevo">Nuevo</option>
                          <option value="contactado">Contactado</option>
                          <option value="calificado">Calificado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Días transcurridos</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.conditions.days_since || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            conditions: {...formData.conditions, days_since: parseInt(e.target.value)}
                          })}
                          placeholder="Ej: 7"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-semibold">Acciones</h4>
                      <button
                        type="button"
                        onClick={addAction}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        + Agregar Acción
                      </button>
                    </div>
                    <div className="space-y-4">
                      {formData.actions.map((action, index) => (
                        <div key={index} className="border p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <select
                              className="px-3 py-2 border border-gray-300 rounded-md"
                              value={action.type}
                              onChange={(e) => updateAction(index, 'type', e.target.value)}
                            >
                              <option value="create_followup">Crear Seguimiento</option>
                              <option value="change_status">Cambiar Estado</option>
                              <option value="send_notification">Enviar Notificación</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeAction(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              🗑️
                            </button>
                          </div>
                          
                          {action.type === 'create_followup' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm text-gray-600">Tipo</label>
                                <select
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  value={action.followupType || 'llamada'}
                                  onChange={(e) => updateAction(index, 'followupType', e.target.value)}
                                >
                                  <option value="llamada">Llamada</option>
                                  <option value="email">Email</option>
                                  <option value="whatsapp">WhatsApp</option>
                                  <option value="reunion">Reunión</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600">Días de retraso</label>
                                <input
                                  type="number"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  value={action.delayDays || 1}
                                  onChange={(e) => updateAction(index, 'delayDays', parseInt(e.target.value))}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600">Prioridad</label>
                                <select
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  value={action.priority || 'media'}
                                  onChange={(e) => updateAction(index, 'priority', e.target.value)}
                                >
                                  <option value="baja">Baja</option>
                                  <option value="media">Media</option>
                                  <option value="alta">Alta</option>
                                </select>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <label className="block text-sm text-gray-600">Notas</label>
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              value={action.notes || ''}
                              onChange={(e) => updateAction(index, 'notes', e.target.value)}
                              placeholder="Notas de la acción..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Crear Automatización
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
