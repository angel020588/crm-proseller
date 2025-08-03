
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "website",
    status: "nuevo",
    notes: "",
    budget: "",
    interest_level: "medio"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todos");

  const token = localStorage.getItem("token");

  const fetchLeads = async () => {
    try {
      const res = await axios.get("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(res.data);
    } catch (err) {
      setError("Error al cargar leads");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await axios.put(`/api/leads/${editingLead.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post("/api/leads", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      resetForm();
      fetchLeads();
    } catch (err) {
      setError("Error al guardar lead");
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("¿Eliminar este lead?")) return;
    try {
      await axios.delete(`/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeads();
    } catch (err) {
      setError("Error al eliminar lead");
    }
  };

  const convertToClient = async (leadId) => {
    if (!window.confirm("¿Convertir este lead en cliente?")) return;
    try {
      await axios.post(`/api/leads/${leadId}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeads();
    } catch (err) {
      setError("Error al convertir lead");
    }
  };

  const editLead = (lead) => {
    setFormData({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source || "website",
      status: lead.status || "nuevo",
      notes: lead.notes || "",
      budget: lead.budget || "",
      interest_level: lead.interest_level || "medio"
    });
    setEditingLead(lead);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "website",
      status: "nuevo",
      notes: "",
      budget: "",
      interest_level: "medio"
    });
    setEditingLead(null);
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      nuevo: 'bg-blue-100 text-blue-800',
      contactado: 'bg-yellow-100 text-yellow-800',
      calificado: 'bg-purple-100 text-purple-800',
      convertido: 'bg-green-100 text-green-800',
      perdido: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getInterestColor = (level) => {
    const colors = {
      bajo: 'bg-gray-100 text-gray-800',
      medio: 'bg-orange-100 text-orange-800',
      alto: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const filteredLeads = filterStatus === "todos" 
    ? leads 
    : leads.filter(lead => lead.status === filterStatus);

  useEffect(() => { fetchLeads(); }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando leads...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-r from-slate-50 to-purple-100 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">🎯 Gestión de Leads</h1>
        <Link
          to="/"
          className="text-purple-600 hover:underline font-medium text-sm"
        >
          Volver al Panel Principal
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros y Botón Nuevo */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-purple-300 p-2 rounded-lg bg-white"
          >
            <option value="todos">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="calificado">Calificado</option>
            <option value="convertido">Convertido</option>
            <option value="perdido">Perdido</option>
          </select>
          <span className="text-sm text-gray-600">
            {filteredLeads.length} leads encontrados
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors"
        >
          ➕ Nuevo Lead
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {['nuevo', 'contactado', 'calificado', 'convertido', 'perdido'].map(status => {
          const count = leads.filter(lead => lead.status === status).length;
          return (
            <div key={status} className="bg-white p-4 rounded-lg shadow-md text-center border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status}</div>
            </div>
          );
        })}
      </div>

      {/* Lista de Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white p-6 rounded-xl shadow-md border border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-purple-900">{lead.name}</h3>
                <p className="text-sm text-gray-600">{lead.company}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getInterestColor(lead.interest_level)}`}>
                  {lead.interest_level} interés
                </span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm">📧 {lead.email || 'Sin email'}</p>
              <p className="text-sm">📞 {lead.phone || 'Sin teléfono'}</p>
              <p className="text-sm">🌐 Fuente: {lead.source}</p>
              {lead.budget && <p className="text-sm">💰 Presupuesto: €{lead.budget}</p>}
              {lead.notes && <p className="text-sm text-gray-600">📝 {lead.notes}</p>}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => editLead(lead)}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  ✏️ Editar
                </button>
                {lead.status !== 'convertido' && (
                  <button
                    onClick={() => convertToClient(lead.id)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    🔄 Convertir
                  </button>
                )}
              </div>
              <button
                onClick={() => deleteLead(lead.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingLead ? "✏️ Editar Lead" : "➕ Nuevo Lead"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="border border-purple-300 p-3 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="border border-purple-300 p-3 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="border border-purple-300 p-3 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Empresa"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="border border-purple-300 p-3 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                />
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="border border-purple-300 p-3 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="website">Sitio Web</option>
                  <option value="referido">Referido</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google</option>
                  <option value="llamada">Llamada fría</option>
                  <option value="evento">Evento</option>
                  <option value="otro">Otro</option>
                </select>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="border border-purple-300 p-3 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="contactado">Contactado</option>
                  <option value="calificado">Calificado</option>
                  <option value="convertido">Convertido</option>
                  <option value="perdido">Perdido</option>
                </select>
                <input
                  type="number"
                  placeholder="Presupuesto estimado (€)"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="border border-purple-300 p-3 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                />
                <select
                  value={formData.interest_level}
                  onChange={(e) => setFormData({...formData, interest_level: e.target.value})}
                  className="border border-purple-300 p-3 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="bajo">Interés Bajo</option>
                  <option value="medio">Interés Medio</option>
                  <option value="alto">Interés Alto</option>
                </select>
              </div>
              
              <textarea
                placeholder="Notas adicionales..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="3"
                className="w-full border border-purple-300 p-3 rounded-lg focus:border-purple-500 focus:ring-purple-500"
              />

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
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                >
                  {editingLead ? "Actualizar" : "Crear"} Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
