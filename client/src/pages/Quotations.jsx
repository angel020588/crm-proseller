
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Quotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pendiente',
    total: '',
    clientId: '',
    deliveryDate: ''
  });

  useEffect(() => {
    fetchQuotations();
    fetchClients();
  }, []);

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/quotations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotations(response.data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setError('Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Error al cargar clientes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (editingQuotation) {
        await axios.put(`http://localhost:5000/api/quotations/${editingQuotation.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/quotations', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchQuotations();
      resetForm();
      setError("");
    } catch (error) {
      console.error('Error saving quotation:', error);
      setError('Error al guardar cotización');
    }
  };

  const handleEdit = (quotation) => {
    setEditingQuotation(quotation);
    setFormData({
      title: quotation.title,
      description: quotation.description || '',
      status: quotation.status,
      total: quotation.total,
      clientId: quotation.clientId,
      deliveryDate: quotation.deliveryDate ? quotation.deliveryDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cotización?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/quotations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchQuotations();
        setError("");
      } catch (error) {
        console.error('Error deleting quotation:', error);
        setError('Error al eliminar cotización');
      }
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/quotations/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuotations();
      setError("");
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Error al actualizar estado');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pendiente',
      total: '',
      clientId: '',
      deliveryDate: ''
    });
    setEditingQuotation(null);
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      enviada: 'bg-blue-100 text-blue-800',
      aprobada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800',
      cancelada: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando cotizaciones...</div>;
  }

  return (
    <>
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
              <h1 className="text-2xl font-bold text-gray-900">💰 Gestión de Cotizaciones</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            >
              Nueva Cotización
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Lista de Cotizaciones */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {quotations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay cotizaciones creadas</p>
                <p className="text-gray-400 text-sm mt-2">Crea tu primera cotización haciendo clic en "Nueva Cotización"</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entrega
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quotation.title}</div>
                        {quotation.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {quotation.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quotation.Client?.name || 'Cliente no asignado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={quotation.status}
                          onChange={(e) => handleStatusUpdate(quotation.id, e.target.value)}
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(quotation.status)}`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="enviada">Enviada</option>
                          <option value="aprobada">Aprobada</option>
                          <option value="rechazada">Rechazada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${parseFloat(quotation.total).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(quotation.deliveryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(quotation)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          ✏️ Editar
                        </button>
                        <a
                          href={`http://localhost:5000/api/quotations/${quotation.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          📄 PDF
                        </a>
                        <button
                          onClick={() => handleDelete(quotation.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingQuotation ? '✏️ Editar Cotización' : '➕ Nueva Cotización'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Título de la cotización"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    >
                      <option value="">Seleccionar cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} {client.company && `(${client.company})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descripción detallada de la cotización"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={formData.total}
                        onChange={(e) => setFormData({...formData, total: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="enviada">Enviada</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      {editingQuotation ? 'Actualizar' : 'Crear'}
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
