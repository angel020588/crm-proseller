import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Followups() {
  const [followups, setFollowups] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    note: "",
    status: "pendiente",
    date: "",
    clientId: "",
    type: "llamada"
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchFollowups();
    fetchClients();
  }, []);

  const fetchFollowups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/followups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowups(response.data);
    } catch (err) {
      console.error('Error fetching followups:', err);
      setError("Error al cargar seguimientos");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (editingFollowup) {
        await axios.put(`http://localhost:5000/api/followups/${editingFollowup.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post("http://localhost:5000/api/followups", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchFollowups();
      resetForm();
    } catch (err) {
      console.error('Error saving followup:', err);
      setError("Error al guardar seguimiento");
    }
  };

  const handleEdit = (followup) => {
    setEditingFollowup(followup);
    setFormData({
      note: followup.note,
      status: followup.status,
      date: followup.date ? followup.date.split('T')[0] : '',
      clientId: followup.clientId || '',
      type: followup.type || 'llamada'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este seguimiento?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/followups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFollowups();
    } catch (err) {
      console.error('Error deleting followup:', err);
      setError("Error al eliminar seguimiento");
    }
  };

  const resetForm = () => {
    setFormData({
      note: "",
      status: "pendiente",
      date: "",
      clientId: "",
      type: "llamada"
    });
    setEditingFollowup(null);
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      completado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      llamada: 'bg-blue-100 text-blue-800',
      reunion: 'bg-purple-100 text-purple-800',
      email: 'bg-indigo-100 text-indigo-800',
      whatsapp: 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="p-6">
          {/* Header con navegación */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1"
              >
                ← Volver al Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">📞 Gestión de Seguimientos</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Nuevo Seguimiento
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Tabla de Seguimientos */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seguimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {followups.map((followup) => (
                  <tr key={followup.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{followup.note}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {followup.Client?.name || 'Sin cliente'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(followup.type)}`}>
                        {followup.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(followup.status)}`}>
                        {followup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {followup.date ? new Date(followup.date).toLocaleDateString() : 'Sin fecha'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(followup)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(followup.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {followups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay seguimientos registrados
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {editingFollowup ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nota/Descripción</label>
                    <textarea
                      required
                      rows="3"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.note}
                      onChange={(e) => setFormData({...formData, note: e.target.value})}
                      placeholder="Descripción del seguimiento"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    >
                      <option value="">Seleccionar cliente (opcional)</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} {client.company && `(${client.company})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="llamada">Llamada</option>
                      <option value="reunion">Reunión</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="completado">Completado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <input
                      type="date"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
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
                      {editingFollowup ? 'Actualizar' : 'Crear'}
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